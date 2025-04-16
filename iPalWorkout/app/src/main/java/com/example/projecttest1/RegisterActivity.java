package com.example.projecttest1;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.avatarmind.robotvisionservice.RobotVisionClient;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.*;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3Client;

import org.json.JSONObject;

import java.io.File;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class RegisterActivity extends Activity {

    private RobotVisionClient robotVisionClient;
    private EditText nameInput;
    private CognitoCachingCredentialsProvider credentialsProvider;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        // ✅ Initialize Cognito credentials
        credentialsProvider = new CognitoCachingCredentialsProvider(
                getApplicationContext(),
                "us-east-1:b055d199-6cd6-4466-a107-e4db39e81f95",
                Regions.US_EAST_1
        );

        nameInput = (EditText) findViewById(R.id.name_input);
        final Button registerButton = (Button) findViewById(R.id.btn_register);
        final Button backButton = (Button) findViewById(R.id.btn_back);

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        registerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final String fullname = nameInput.getText().toString().trim();

                if (fullname.isEmpty()) {
                    Toast.makeText(RegisterActivity.this, "Please enter a name", Toast.LENGTH_SHORT).show();
                    return;
                }

                robotVisionClient = new RobotVisionClient("FaceID", RegisterActivity.this, new RobotVisionClient.FaceEventListener() {
                    @Override
                    public void onConnectionStatus(boolean isConnected) {
                        Log.d("Vision", "Connected: " + isConnected);
                    }

                    @Override
                    public void onVisionEvent(String event) {
                        Log.d("VisionEvent", event);
                    }

                    @Override
                    public void OnRegisterEvent(String event) {
                        Log.d("RegisterEvent", event);

                        final File faceImage = new File("/sdcard/RobotFaceData/" + fullname + ".jpg");

                        if (faceImage.exists()) {
                            AmazonS3Client s3Client = new AmazonS3Client(credentialsProvider);
                            TransferUtility transferUtility = TransferUtility.builder()
                                    .context(getApplicationContext())
                                    .s3Client(s3Client)
                                    .build();

                            final String objectKey = "faceids/" + fullname + "/face.jpg";

                            TransferObserver observer = transferUtility.upload(
                                    "ipal-face-data",
                                    objectKey,
                                    faceImage
                            );

                            observer.setTransferListener(new TransferListener() {
                                @Override
                                public void onStateChanged(int id, TransferState state) {
                                    if (state == TransferState.COMPLETED) {
                                        Log.d("S3", "✅ Upload complete!");
                                        String imageUrl = "https://ipal-face-data.s3.amazonaws.com/" + objectKey;
                                        sendFaceDataToBackend(fullname, imageUrl);
                                    }
                                }

                                @Override
                                public void onProgressChanged(int id, long current, long total) {}

                                @Override
                                public void onError(int id, Exception e) {
                                    Log.e("S3", "❌ Upload failed: " + e.getMessage());
                                }
                            });
                        } else {
                            Log.e("S3", "❌ Face image not found: /sdcard/RobotFaceData/" + fullname + ".jpg");
                        }
                    }

                    @Override
                    public void OnHeadUpdate(int direction) {
                        Log.d("FaceEvent", "Head direction update: " + direction);
                    }
                }, true, true);

                // 🔁 Begin face registration
                robotVisionClient.UserAddByPhoto("FaceID", RegisterActivity.this, fullname, "faceKey123", true, true, "/sdcard/RobotFaceData/");
            }
        });
    }

    // 🔁 Send Face ID metadata to Node.js backend
    private void sendFaceDataToBackend(String fullname, String imageUrl) {
        int userId = 1; // TODO: Replace with real session-based user ID

        try {
            URL url = new URL("http://34.200.158.192:3000/register-face");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setDoOutput(true);

            JSONObject faceData = new JSONObject();
            faceData.put("user_id", userId);
            faceData.put("fullname", fullname);
            faceData.put("nickname", fullname.split("\\.")[0]);
            faceData.put("confidence_score", 85);
            faceData.put("face_detected_date", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
            faceData.put("head_image_url", imageUrl);
            faceData.put("face_rect_x", 0);
            faceData.put("face_rect_y", 0);
            faceData.put("face_rect_w", 0);
            faceData.put("face_rect_h", 0);

            OutputStream os = conn.getOutputStream();
            os.write(faceData.toString().getBytes("UTF-8"));
            os.close();

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                Log.d("Backend", "✅ Metadata sent to backend");
            } else {
                Log.e("Backend", "❌ Backend error: HTTP " + responseCode);
            }

            conn.disconnect();
        } catch (Exception e) {
            Log.e("Backend", "❌ Exception: " + e.getMessage());
        }
    }
}
