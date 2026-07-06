package vn.edu.hust.quizflow.service;

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

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostViewRepository postViewRepository;
    private final CloudinaryService cloudinaryService;
    private final RabbitTemplate rabbitTemplate;
    private final Client meilisearchClient;

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
        
        return mapToResponse(savedPost, attachments);
    }

    public Page<PostResponse> getPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> {
                    List<PostAttachment> attachments = postAttachmentRepository.findByPostId(post.getId());
                    return mapToResponse(post, attachments);
                });
    }

    @Transactional
    public PostResponse getPostDetail(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

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
            }
        }

        List<PostAttachment> attachments = postAttachmentRepository.findByPostId(postId);
        return mapToResponse(post, attachments);
    }

    public Object searchPosts(String query) {
        try {
            Index index = meilisearchClient.index("posts");
            com.meilisearch.sdk.model.Searchable result = index.search(new SearchRequest(query));
            return result;
        } catch (Exception e) {
            // Fallback to database search if Meilisearch is down
            org.springframework.data.domain.Page<Post> dbResults = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, org.springframework.data.domain.PageRequest.of(0, 50));
            return dbResults.map(post -> {
                List<PostAttachment> attachments = postAttachmentRepository.findByPostId(post.getId());
                return mapToResponse(post, attachments);
            }).getContent();
        }
    }

    private PostResponse mapToResponse(Post post, List<PostAttachment> attachments) {
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
                .downvotes(0)
                .commentsCount(post.getCommentsCount())
                .build();
    }
}
