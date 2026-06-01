import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function syncUserProfile(user: FirebaseUser, customName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email || '',
        displayName: customName || user.displayName || 'Freesia User',
        createdAt: serverTimestamp(),
        phone: user.phoneNumber || '',
        photoUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`
      });
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
  }
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  await syncUserProfile(credential.user);
  return credential.user;
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: displayName.trim() });
  await syncUserProfile(credential.user, displayName.trim());
  return credential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  // Using signInWithPopup for local/container dev iframe friendliness
  const credential = await signInWithPopup(auth, provider);
  await syncUserProfile(credential.user);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}
