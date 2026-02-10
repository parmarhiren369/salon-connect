# Firebase Configuration Instructions

## Firestore Database Rules

To set up your Firestore database rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **salon-connect-243e4**
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all operations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    // Billings collection
    match /billings/{billingId} {
      allow read, write: if request.auth != null;
    }
    
    // Templates collection
    match /templates/{templateId} {
      allow read, write: if request.auth != null;
    }
    
    // User profiles (optional, for future use)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish** to save the rules

## Firebase Storage Rules

If you plan to use Firebase Storage for images:

1. Navigate to **Storage** → **Rules**
2. Copy and paste the following rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

## Firebase Authentication Setup

1. Navigate to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable other providers like Google if needed

## Security Best Practices

### Production Rules (More Restrictive)

For production, consider these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Customers - only authenticated users can access
    match /customers/{customerId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.keys().hasAll(['name', 'mobile', 'date']);
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Billings - only authenticated users can access
    match /billings/{billingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                      request.resource.data.keys().hasAll(['customerId', 'service', 'amount', 'date']);
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Templates - only authenticated users can access
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
  }
}
```

## Testing Your Rules

After setting up the rules, test them:

1. Try logging in to your application
2. Try adding a customer, billing, or template
3. Verify that unauthenticated users cannot access data
4. Check the Firebase Console for any security warnings

## Important Notes

- **Always require authentication** for production applications
- **Never use test mode rules** (`allow read, write: if true;`) in production
- **Regularly review** your security rules
- **Monitor usage** in Firebase Console to detect unusual activity
- **Enable App Check** for additional security (optional but recommended)

## Environment Variables (Optional)

For better security, consider using environment variables for sensitive data:

1. Create a `.env` file in your project root (already gitignored)
2. Move Firebase config to environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyCSQNETlZMQvhqMhTAWBsU_O1ZPzuUluq0
VITE_FIREBASE_AUTH_DOMAIN=salon-connect-243e4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=salon-connect-243e4
VITE_FIREBASE_STORAGE_BUCKET=salon-connect-243e4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=363552350895
VITE_FIREBASE_APP_ID=1:363552350895:web:b09eddb4bfdabd2fb0aa5a
VITE_FIREBASE_MEASUREMENT_ID=G-SXGTVSWVHQ
```

3. Update `src/lib/firebase.ts` to use environment variables

## Support

For issues or questions about Firebase setup, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
