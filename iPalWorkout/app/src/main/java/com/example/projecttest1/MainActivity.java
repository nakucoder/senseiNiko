package com.example.projecttest1;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.content.Intent;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.regions.Regions;

public class MainActivity extends Activity {

    // ✅ Make this accessible to other classes like RegisterActivity or S3Uploader
    public static CognitoCachingCredentialsProvider credentialsProvider;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ✅ Initialize Cognito
        credentialsProvider = new CognitoCachingCredentialsProvider(
                getApplicationContext(),
                "us-east-1:b055d199-6cd6-4466-a107-e4db39e81f95", // your Cognito Identity Pool ID
                Regions.US_EAST_1 // your region
        );

        // Exit Button
        Button exitButton = (Button) findViewById(R.id.btn_exit);
        exitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                exitApplication();
            }
        });

        // Sign Up Button
        Button signUpButton = (Button) findViewById(R.id.btn_sign_up);
        signUpButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                signUp();
            }
        });

        // Sign In Button
        Button signInButton = (Button) findViewById(R.id.btn_sign_in);
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, LoginActivity.class);
                startActivity(intent);
            }
        });
    }

    private void exitApplication() {
        Log.d("MainActivity", "Exiting application...");
        finish();
    }

    private void signUp() {
        Log.d("MainActivity", "Sign Up button clicked!");
    }

    private void signIn() {
        Log.d("MainActivity", "Sign In button clicked!");
    }
}
