package com.example.projecttest1;

import android.content.Context;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.regions.Regions;

public class AWSMobileClientHelper {

    private static CognitoCachingCredentialsProvider credentialsProvider;

    public static void init(Context context) {
        credentialsProvider = new CognitoCachingCredentialsProvider(
                context,
                "us-east-1:b055d199-6cd6-4466-a107-e4db39e81f95", // e.g. us-east-1:xxxx-xxxx-xxxx
                Regions.US_EAST_1        // Change based on your region
        );
    }

    public static CognitoCachingCredentialsProvider getCredentialsProvider() {
        return credentialsProvider;
    }
}
