package com.lms.backend.controllers;

import com.lms.backend.Dtos.TeachingRequestDto;
import com.lms.backend.Dtos.TeachingResponseDto;
import com.lms.backend.services.TeachingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Teacher-to-course assignments. All routes are ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api")
public class TeachingController {
    private final TeachingService teachingService;

    public TeachingController(TeachingService teachingService) {
        this.teachingService = teachingService;
    }

    @GetMapping("/teaches")
    public List<TeachingResponseDto> all() {
        return teachingService.all();
    }

    @PostMapping("/teaches")
    public ResponseEntity<TeachingResponseDto> assign(@RequestBody TeachingRequestDto body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teachingService.assign(body));
    }

    @PutMapping("/teaches/{id}")
    public TeachingResponseDto update(@PathVariable Long id, @RequestBody TeachingRequestDto body) {
        return teachingService.update(id, body);
    }

    @DeleteMapping("/teaches/{id}")
    public ResponseEntity<Void> unassign(@PathVariable Long id) {
        teachingService.unassign(id);
        return ResponseEntity.noContent().build();
    }
}
