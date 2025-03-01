import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useAuthStore } from "../../store";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../../utils/validation";
import { useImagePicker } from "../../hooks/useImagePicker";

interface RegisterFormProps {
  onToggleForm: () => void;
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onToggleForm,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const { image, pickImage } = useImagePicker();
  const { register, isLoading, error } = useAuthStore();

  const validateForm = (): boolean => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !nameErr && !emailErr && !passwordErr;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmissionError("");

    try {
      const operations = {
        query: `
        mutation Signup($input: SignupInput!, $profileImage: Upload) {
          signup(input: $input, profileImage: $profileImage) {
            _id
            name
            email
            role
            profileImageUrl
            points
          }
        }
      `,
        variables: {
          input: { name, email, password, role: "STUDENT" },
          profileImage: image ? null : undefined,
        },
      };

      const formData = new FormData();
      formData.append("operations", JSON.stringify(operations));

      if (image) {
        const map = { "0": ["variables.profileImage"] };
        formData.append("map", JSON.stringify(map));

        const imageFile = {
          uri: image.uri,
          name: image.name || "profile.jpg",
          type: image.type || "image/jpeg",
        };

        formData.append("0", imageFile);
      }

      console.log("FormData keys:", Object.keys(formData));

      const response = await fetch("http://192.168.9.93:3000/graphql", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-apollo-operation-name": "Signup",
          "apollo-require-preflight": "true",
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      const result = responseText ? JSON.parse(responseText) : {};
      console.log("Registration result:", result);

      if (result.data && result.data.signup) {
        onSuccess();
      } else if (result.errors) {
        const errorMessage = result.errors[0]?.message || "Registration failed";
        setSubmissionError(errorMessage);
      }
    } catch (err) {
      console.error("Register error:", err);
      setSubmissionError(
        "Network error or invalid response. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Full Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
        error={!!nameError}
        disabled={isLoading}
      />
      {nameError ? <HelperText type="error">{nameError}</HelperText> : null}

      <View style={styles.profileImageContainer}>
        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.imagePickerButton}
          disabled={isLoading}
        >
          {image ? "Change Profile Image" : "Upload Profile Image"}
        </Button>
        {image && (
          <Image
            source={{ uri: image.uri }}
            style={styles.profileImagePreview}
          />
        )}
      </View>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        error={!!emailError}
        disabled={isLoading}
      />
      {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        error={!!passwordError}
        disabled={isLoading}
      />
      {passwordError ? (
        <HelperText type="error">{passwordError}</HelperText>
      ) : null}

      {(error || submissionError) && (
        <HelperText type="error">{error || submissionError}</HelperText>
      )}

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      >
        Register
      </Button>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <HelperText style={styles.dividerText}>OR</HelperText>
        <View style={styles.dividerLine} />
      </View>

      <Button
        mode="text"
        style={styles.toggleButton}
        labelStyle={styles.toggleButtonLabel}
        onPress={onToggleForm}
        disabled={isLoading}
      >
        Already have an account? Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    marginBottom: 8,
    backgroundColor: "white",
  },
  profileImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  imagePickerButton: {
    flex: 1,
    borderColor: "#6C63FF",
  },
  profileImagePreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 16,
  },
  submitButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    marginTop: 8,
    elevation: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#6B7280",
    fontSize: 14,
    backgroundColor: "transparent",
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  toggleButton: {
    marginTop: 8,
  },
  toggleButtonLabel: {
    color: "#6C63FF",
    fontSize: 14,
  },
});

export default RegisterForm;
