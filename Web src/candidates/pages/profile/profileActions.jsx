import { toastr } from 'react-redux-toastr';

export const updateCandProfile = (user) =>
  async (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase();
    const {isLoaded, isEmpty, ...updatedUser} = user;
    const newUser = {
      ...updatedUser,
      stage2: true
    }
    try {
      await firebase.updateProfile(newUser);
      toastr.success('Success', 'Profile updated')
    }
    catch (error) {
      console.log(error);
    }
  }

export const uploadProfileImage = (file, fileName) =>
  async (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase();
    const firestore = getFirestore();
    const user = firebase.auth().currentUser;
    const path = `${user.uid}/user_images`;
    const options = {
      name: fileName
    };
    try {
      console.log(1);
      // upload file to firebase storage
      let uploadedFile = await firebase.uploadFile(path, file, null, options);
       // get url of image
      let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;
      // get userdoc
      let userDoc = await firestore.get(`users/${user.uid}`);
      // check if user has photo, if not update profile with new image
      if (!userDoc.data().photoURL) {
        await firebase.updateProfile({
          photoURL: downloadURL
        });
        await user.updateProfile({
          photoURL: downloadURL
        })
      }
      // add the new photo to photos collection
      return await firestore.add({
        collection: 'users',
        doc: user.uid,
        subcollections: [{collection: 'photos'}]
      }, {
        name: fileName,
        url: downloadURL
      })
    }
    catch (error) {
      console.log(error);
      throw new Error('Problem uploading photos');
    }
  }