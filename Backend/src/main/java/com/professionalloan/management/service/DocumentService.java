package com.professionalloan.management.service;

import com.professionalloan.management.model.Document;
import com.professionalloan.management.model.User;
import com.professionalloan.management.repository.DocumentRepository;
import com.professionalloan.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Document saveDocument(MultipartFile file, Long userId, String documentType) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir + "/" + userId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to filesystem
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create document record
            Document document = new Document();
            document.setUser(user);
            document.setFileName(originalFilename);
            document.setFileType(documentType);
            document.setFilePath(filePath.toString());
            document.setUploadDate(LocalDateTime.now());
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setVerified(false);

            return documentRepository.save(document);
        } catch (Exception e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByUser_Id(userId);
    }

    public Resource loadDocument(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading document: " + e.getMessage());
        }
    }

    public void deleteDocument(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

            // Delete file from filesystem
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);

            // Delete database record
            documentRepository.delete(document);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting document: " + e.getMessage());
        }
    }

    public List<Document> getUserDocumentsByType(Long userId, String documentType) {
        return documentRepository.findByUser_IdAndFileType(userId, documentType);
    }

    public void verifyDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setVerified(true);
        documentRepository.save(document);
    }
} 