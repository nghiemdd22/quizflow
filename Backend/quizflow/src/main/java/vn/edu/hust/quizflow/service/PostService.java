package vn.edu.hust.quizflow.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hust.quizflow.dto.request.CreatePostRequest;
import vn.edu.hust.quizflow.dto.response.PostAttachmentResponse;
import vn.edu.hust.quizflow.dto.response.PostResponse;
import vn.edu.hust.quizflow.dto.response.TagResponse;
import vn.edu.hust.quizflow.entity.*;
import vn.edu.hust.quizflow.repository.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.SearchRequest;
import com.meilisearch.sdk.model.SearchResult;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.PostSyncMessage;

import java.time.ZoneOffset;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ cốt lõi liên quan đến Bài viết (Post) trên Diễn đàn hỏi đáp.
 * Bao gồm: tạo bài viết, tải tài liệu đính kèm, tìm kiếm (Full-text Search), xem chi tiết và Vote.
 */
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostViewRepository postViewRepository;
    private final PostVoteRepository postVoteRepository;
    private final CloudinaryService cloudinaryService;
    private final RabbitTemplate rabbitTemplate;
    private final Client meilisearchClient;
    private final EntityManager entityManager;

    /**
     * Tạo một bài viết mới trên diễn đàn.
     * Quy trình:
     * 1. Lưu bài viết vào Database (MySQL).
     * 2. Upload các file đính kèm (nếu có) lên máy chủ Cloudinary để lấy link URL, rồi lưu lại.
     * 3. Gửi thông tin bài viết sang RabbitMQ để đẩy qua Meilisearch phục vụ tìm kiếm tốc độ cao.
     *
     * @param username Tên đăng nhập của sinh viên/người dùng tạo bài viết
     * @param request Payload chứa tiêu đề, nội dung, danh sách file, và các tag
     * @return DTO mang thông tin bài viết vừa được tạo
     */
    @Transactional
    public PostResponse createPost(String username, CreatePostRequest request) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        List<Tag> tags = tagRepository.findAllById(request.getTagIds());
        if (tags.isEmpty()) {
            throw new IllegalArgumentException("Tags không hợp lệ");
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .tags(new HashSet<>(tags))
                .build();

        Post savedPost = postRepository.save(post);

        List<PostAttachment> attachments = new ArrayList<>();
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            for (MultipartFile file : request.getFiles()) {
                try {
                    Map uploadResult = cloudinaryService.uploadFile(file);
                    String fileUrl = uploadResult.get("secure_url").toString();
                    
                    PostAttachment attachment = PostAttachment.builder()
                            .post(savedPost)
                            .fileUrl(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .fileType(file.getContentType())
                            .build();
                    attachments.add(postAttachmentRepository.save(attachment));
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi khi upload file đính kèm: " + e.getMessage());
                }
            }
        }

        // Gửi message sang RabbitMQ để đồng bộ Meilisearch (Sprint 3)
        PostSyncMessage syncMessage = PostSyncMessage.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .authorName(author.getFullName())
                .tags(savedPost.getTags().stream().map(Tag::getName).collect(Collectors.toList()))
                .timestamp(savedPost.getCreatedAt().toEpochSecond(ZoneOffset.UTC))
                .build();
                
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.MEILISEARCH_SYNC_EXCHANGE,
                RabbitMQConfig.MEILISEARCH_SYNC_ROUTING_KEY,
                syncMessage
        );
        
        return mapToResponse(savedPost, attachments, 0);
    }

    /**
     * Lấy danh sách bài viết trên diễn đàn, phân trang và sắp xếp bài mới nhất lên trên.
     * Đồng thời, nhúng kèm thông tin để biết người đang xem hiện tại đã vote bài nào chưa.
     *
     * @param pageable Cấu hình phân trang (số trang, số phần tử trên trang)
     * @param username Tên của người dùng đang xem (tùy chọn, để xem trạng thái vote)
     * @return Danh sách phân trang bài viết
     */
    public Page<PostResponse> getPosts(Pageable pageable, String username) {
        User user = null;
        if (username != null && !username.isEmpty()) {
            user = userRepository.findByUsername(username).orElse(null);
        }
        final User currentUser = user;
        
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> {
                    List<PostAttachment> attachments = postAttachmentRepository.findByPostId(post.getId());
                    int currentUserVote = 0;
                    if (currentUser != null) {
                        PostVote vote = postVoteRepository.findByPostIdAndUserId(post.getId(), currentUser.getId()).orElse(null);
                        if (vote != null) currentUserVote = vote.getVoteType();
                    }
                    return mapToResponse(post, attachments, currentUserVote);
                });
    }

    /**
     * Xem chi tiết một bài viết cụ thể dựa vào ID.
     * Tự động tăng lượt xem (View Count) nếu người này chưa từng xem bài viết này trước đây.
     *
     * @param postId ID của bài viết cần đọc
     * @param username Tên đăng nhập của người đang xem
     * @return Thông tin toàn diện về bài viết (nội dung, file, số lượt upvote/downvote)
     */
    @Transactional
    public PostResponse getPostDetail(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        int currentUserVote = 0;
        if (username != null && !username.isEmpty()) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                boolean alreadyViewed = postViewRepository.existsByPostIdAndUserId(postId, user.getId());
                if (!alreadyViewed) {
                    PostView view = PostView.builder().post(post).user(user).build();
                    postViewRepository.save(view);
                    
                    post.setViewsCount(post.getViewsCount() + 1);
                    postRepository.save(post);
                }
                
                PostVote vote = postVoteRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);
                if (vote != null) currentUserVote = vote.getVoteType();
            }
        }

        List<PostAttachment> attachments = postAttachmentRepository.findByPostId(postId);
        return mapToResponse(post, attachments, currentUserVote);
    }

    /**
     * Chức năng tìm kiếm toàn văn bản (Full-text Search).
     * Sử dụng Meilisearch (cực nhanh, hỗ trợ gõ sai chính tả).
     * Có cơ chế hạ cấp (Fallback) thông minh: Nếu Meilisearch sập thì tự động chạy tìm kiếm bằng SQL để tránh làm web ngừng hoạt động.
     *
     * @param query Từ khóa tìm kiếm
     * @param username Người tìm kiếm
     * @return Kết quả có thể đến từ Meilisearch (nhanh) hoặc Database (chậm hơn)
     */
    public Object searchPosts(String query, String username) {
        User user = null;
        if (username != null && !username.isEmpty()) {
            user = userRepository.findByUsername(username).orElse(null);
        }
        final User currentUser = user;
        try {
            Index index = meilisearchClient.index("posts");
            com.meilisearch.sdk.model.Searchable result = index.search(new SearchRequest(query));
            return result;
        } catch (Exception e) {
            // Cơ chế Fallback an toàn:
            // Nếu Meilisearch lỗi (Server sập hoặc chưa bật), thì quay xe dùng truy vấn LIKE trên Database
            org.springframework.data.domain.Page<Post> dbResults = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, org.springframework.data.domain.PageRequest.of(0, 50));
            return dbResults.map(post -> {
                List<PostAttachment> attachments = postAttachmentRepository.findByPostId(post.getId());
                int currentUserVote = 0;
                if (currentUser != null) {
                    PostVote vote = postVoteRepository.findByPostIdAndUserId(post.getId(), currentUser.getId()).orElse(null);
                    if (vote != null) currentUserVote = vote.getVoteType();
                }
                return mapToResponse(post, attachments, currentUserVote);
            }).getContent();
        }
    }

    /**
     * Xử lý hành động Vote cho một bài viết (Upvote, Downvote hoặc Hủy vote).
     * Logic Toggle:
     * - Bấm Upvote khi đang Upvote -> Hủy.
     * - Bấm Upvote khi đang Downvote -> Đổi thành Upvote.
     *
     * @param postId ID bài viết bị vote
     * @param username Tên người thực hiện
     * @param voteType 1 (Up), -1 (Down), 0 (Bỏ vote)
     * @return Trạng thái bài viết sau khi được cập nhật số liệu
     */
    @Transactional
    public PostResponse votePost(Long postId, String username, int voteType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        PostVote existingVote = postVoteRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);

        if (voteType == 0) {
            if (existingVote != null) {
                postVoteRepository.delete(existingVote);
            }
        } else {
            if (existingVote != null) {
                if (existingVote.getVoteType() == voteType) {
                    postVoteRepository.delete(existingVote); // Toggle off if clicked same
                } else {
                    existingVote.setVoteType(voteType);
                    postVoteRepository.save(existingVote);
                }
            } else {
                PostVote newVote = PostVote.builder()
                        .post(post)
                        .user(user)
                        .voteType(voteType)
                        .build();
                postVoteRepository.save(newVote);
            }
        }

        // Ép Hibernate xả dữ liệu thay đổi xuống Database ngay lập tức (flush)
        // và yêu cầu load lại Entity bài viết (refresh).
        // Mục đích: Tính toán lại tức thì số lượng Upvote/Downvote ở cột ảo (@Formula) trong entity Post
        postVoteRepository.flush();
        entityManager.refresh(post);
        List<PostAttachment> attachments = postAttachmentRepository.findByPostId(postId);
        
        int currentUserVote = 0;
        PostVote currentVote = postVoteRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);
        if (currentVote != null) currentUserVote = currentVote.getVoteType();
        
        return mapToResponse(post, attachments, currentUserVote);
    }

    private PostResponse mapToResponse(Post post, List<PostAttachment> attachments, int currentUserVote) {
        List<TagResponse> tagResponses = post.getTags().stream()
                .map(t -> TagResponse.builder().id(t.getId()).name(t.getName()).build())
                .collect(Collectors.toList());

        List<PostAttachmentResponse> attachmentResponses = attachments.stream()
                .map(a -> PostAttachmentResponse.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .fileUrl(a.getFileUrl())
                        .fileType(a.getFileType())
                        .build())
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getFullName())
                .viewsCount(post.getViewsCount())
                .createdAt(post.getCreatedAt())
                .tags(tagResponses)
                .attachments(attachmentResponses)
                .upvotes(post.getUpvotes())
                .downvotes(post.getDownvotes())
                .commentsCount(post.getCommentsCount())
                .currentUserVote(currentUserVote)
                .build();
    }
}
