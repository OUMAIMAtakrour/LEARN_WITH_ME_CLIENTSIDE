import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store";
import { validateEmail, validatePassword } from "../../utils/validation";

interface LoginFormProps {
  onToggleForm: () => void;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onToggleForm,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login, isLoading, error } = useAuthStore();

  const validateForm = (): boolean => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    const success = await login(email, password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <View style={styles.container}>
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

      {error && <HelperText type="error">{error}</HelperText>}

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      >
        Login
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
        Need an account? Register
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

export default LoginForm;
