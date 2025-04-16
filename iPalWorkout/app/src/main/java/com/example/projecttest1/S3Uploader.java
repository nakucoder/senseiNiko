package com.example.projecttest1;

import android.content.Context;
import android.util.Log;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.*;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3Client;

import java.io.File;

public class S3Uploader {

    private static final String TAG = "S3Uploader";
    private static final String BUCKET_NAME = "ipal-face-data"; // Make sure this matches your actual bucket name

    private final TransferUtility transferUtility;

    public S3Uploader(Context context, CognitoCachingCredentialsProvider credentialsProvider) {
        AmazonS3Client s3Client = new AmazonS3Client(credentialsProvider);
        transferUtility = TransferUtility.builder()
                .context(context)
                .s3Client(s3Client)
                .build();
    }

    public void uploadFile(File file, String s3Key) {
        if (!file.exists()) {
            Log.e(TAG, "❌ File does not exist: " + file.getAbsolutePath());
            return;
        }

        TransferObserver observer = transferUtility.upload(
                BUCKET_NAME,
                s3Key,
                file
        );

        observer.setTransferListener(new TransferListener() {
            @Override
            public void onStateChanged(int id, TransferState state) {
                if (state == TransferState.COMPLETED) {
                    Log.d(TAG, "✅ File uploaded successfully to S3!");
                }
            }

            @Override
            public void onProgressChanged(int id, long current, long total) {}

            @Override
            public void onError(int id, Exception e) {
                Log.e(TAG, "❌ Upload failed: " + e.getMessage());
            }
        });
    }
}
