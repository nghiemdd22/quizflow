package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.request.CommentRequest;
import vn.edu.hust.quizflow.dto.response.CommentResponse;
import vn.edu.hust.quizflow.entity.Comment;
import vn.edu.hust.quizflow.entity.CommentVote;
import vn.edu.hust.quizflow.entity.Post;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.CommentRepository;
import vn.edu.hust.quizflow.repository.CommentVoteRepository;
import vn.edu.hust.quizflow.repository.PostRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentVoteRepository commentVoteRepository;

    @Transactional
    public CommentResponse addComment(Long postId, String username, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        Comment comment = Comment.builder()
                .post(post)
                .author(user)
                .content(request.getContent())
                .build();
        return mapToResponse(commentRepository.save(comment), 0);
    }

    public List<CommentResponse> getComments(Long postId, String username) {
        User user = null;
        if (username != null && !username.isEmpty()) {
            user = userRepository.findByUsername(username).orElse(null);
        }
        
        final User currentUser = user;
        // Lấy danh sách, accepted đưa lên trước, sau đó theo thời gian cũ -> mới
        return commentRepository.findByPostIdOrderByIsAcceptedDescCreatedAtAsc(postId).stream()
                .map(comment -> {
                    int userVote = 0;
                    if (currentUser != null) {
                        Optional<CommentVote> vote = commentVoteRepository.findByCommentIdAndUserId(comment.getId(), currentUser.getId());
                        if (vote.isPresent()) {
                            userVote = vote.get().getVoteType();
                        }
                    }
                    return mapToResponse(comment, userVote);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void voteComment(Long commentId, String username, int voteType) {
        if (voteType != 1 && voteType != -1) {
            throw new IllegalArgumentException("Vote type không hợp lệ");
        }
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bình luận"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        Optional<CommentVote> existingVote = commentVoteRepository.findByCommentIdAndUserId(commentId, user.getId());
        
        if (existingVote.isPresent()) {
            CommentVote vote = existingVote.get();
            if (vote.getVoteType() == voteType) {
                // Hủy vote
                if (voteType == 1) comment.setUpvoteCount(comment.getUpvoteCount() - 1);
                else comment.setDownvoteCount(comment.getDownvoteCount() - 1);
                commentVoteRepository.delete(vote);
            } else {
                // Đổi vote
                if (voteType == 1) {
                    comment.setDownvoteCount(comment.getDownvoteCount() - 1);
                    comment.setUpvoteCount(comment.getUpvoteCount() + 1);
                } else {
                    comment.setUpvoteCount(comment.getUpvoteCount() - 1);
                    comment.setDownvoteCount(comment.getDownvoteCount() + 1);
                }
                vote.setVoteType(voteType);
                commentVoteRepository.save(vote);
            }
        } else {
            // Vote mới
            if (voteType == 1) comment.setUpvoteCount(comment.getUpvoteCount() + 1);
            else comment.setDownvoteCount(comment.getDownvoteCount() + 1);
            
            CommentVote vote = CommentVote.builder()
                    .comment(comment)
                    .user(user)
                    .voteType(voteType)
                    .build();
            commentVoteRepository.save(vote);
        }
        commentRepository.save(comment);
    }

    @Transactional
    public void acceptComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bình luận"));
        
        Post post = comment.getPost();
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new IllegalArgumentException("Chỉ tác giả bài viết mới được duyệt câu trả lời");
        }

        // Bỏ duyệt tất cả các comment khác
        List<Comment> allComments = commentRepository.findByPostId(post.getId());
        for (Comment c : allComments) {
            if (c.isAccepted() && !c.getId().equals(commentId)) {
                c.setAccepted(false);
                commentRepository.save(c);
            }
        }

        comment.setAccepted(!comment.isAccepted()); // Toggle
        commentRepository.save(comment);
    }

    private CommentResponse mapToResponse(Comment comment, int currentUserVote) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFullName())
                .isAccepted(comment.isAccepted())
                .upvoteCount(comment.getUpvoteCount())
                .downvoteCount(comment.getDownvoteCount())
                .createdAt(comment.getCreatedAt())
                .currentUserVote(currentUserVote)
                .build();
    }
}
