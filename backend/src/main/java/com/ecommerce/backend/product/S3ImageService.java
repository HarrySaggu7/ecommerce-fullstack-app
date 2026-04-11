package com.ecommerce.backend.product;

import com.ecommerce.backend.config.S3Properties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3ImageService {
    private final S3Properties s3Properties;
    private final S3Client s3Client;

    public S3ImageService(S3Properties s3Properties) {
        this.s3Properties = s3Properties;
        this.s3Client = S3Client.builder()
                .region(Region.of(s3Properties.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                s3Properties.getAccessKeyId(),
                                s3Properties.getSecretAccessKey()
                        )
                ))
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String key = "product-images/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(s3Properties.getBucketName())
                            .key(key)
                            .acl("public-read")
                            .contentType(file.getContentType())
                            .build(),
                    software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
            );
        } catch (S3Exception e) {
            throw new IOException("Failed to upload file to S3", e);
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", s3Properties.getBucketName(), s3Properties.getRegion(), key);
    }
}
