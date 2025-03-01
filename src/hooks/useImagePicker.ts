import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export const useImagePicker = () => {
  const [image, setImage] = useState<ImageFile | null>(null);

  const pickImage = async (): Promise<void> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert(
          "Sorry, we need camera roll permissions to upload a profile image!"
        );
        return;
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      alert("Could not request permissions. Please check app settings.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      console.log("ImagePicker result:", JSON.stringify(result, null, 2));

      if (!result.canceled) {
        let selectedAsset;

        if (result.assets && result.assets.length > 0) {
          selectedAsset = result.assets[0];
        } else if (result.uri) {
          selectedAsset = result;
        }

        if (selectedAsset && selectedAsset.uri) {
          const uri = selectedAsset.uri;
          const name = uri.split("/").pop() || "image.jpg";
          const type =
            "image/" + (name.split(".").pop()?.toLowerCase() || "jpeg");

          setImage({
            uri,
            name,
            type,
          });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("There was a problem selecting the image. Please try again.");
    }
  };

  return {
    image,
    pickImage,
    clearImage: () => setImage(null),
  };
};
