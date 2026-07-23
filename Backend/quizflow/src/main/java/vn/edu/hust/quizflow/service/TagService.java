package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.dto.response.TagResponse;
import vn.edu.hust.quizflow.entity.Tag;
import vn.edu.hust.quizflow.repository.TagRepository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TagService {
    
    private final TagRepository tagRepository;

    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TagResponse createTag(String name) {
        if (tagRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Tag đã tồn tại");
        }
        Tag tag = Tag.builder().name(name).build();
        return mapToResponse(tagRepository.save(tag));
    }

    public TagResponse updateTag(Long id, String name) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tag không tồn tại"));
        
        if (tagRepository.findByName(name).isPresent() && !tag.getName().equals(name)) {
            throw new IllegalArgumentException("Tag đã tồn tại");
        }

        tag.setName(name);
        return mapToResponse(tagRepository.save(tag));
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tag không tồn tại"));
        
        // Remove associations in post_tags to prevent foreign key violations
        tagRepository.deletePostTagAssociations(tag.getId());
        
        tagRepository.delete(tag);
    }

    private TagResponse mapToResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}
