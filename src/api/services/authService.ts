import { apolloClient } from "../apollo";
import { LOGIN_MUTATION, SIGNUP_MUTATION } from "../graphql/mutation";
import axios from "axios";
import {
  LoginInput,
  RegisterInput,
  AuthResponse,
  User,
} from "../../types/auth";

const API_URL = "http://192.168.9.93:3000/graphql";

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse | null> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: LOGIN_MUTATION.loc?.source.body,
          variables: { input },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.login;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(
    input: RegisterInput,
    profileImage?: any
  ): Promise<User | null> {
    try {
      const formData = new FormData();

      const query = `
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
    `;

      const operations = {
        query,
        variables: {
          input: {
            name: input.name,
            email: input.email,
            password: input.password,
            role: "STUDENT",
          },
          profileImage: profileImage ? null : undefined,
        },
      };

      formData.append("operations", JSON.stringify(operations));

      const map: Record<string, string[]> = {};
      if (profileImage) {
        map["0"] = ["variables.profileImage"];
        formData.append("map", JSON.stringify(map));

        formData.append("0", {
          uri: profileImage.uri,
          name: profileImage.uri.split("/").pop() || "photo.jpg",
          type: profileImage.type || "image/jpeg",
        } as any);
      } else {
        formData.append("map", "{}");
      }

      console.log("Sending request with formData:", formData);

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-apollo-operation-name": "Signup",
          "apollo-require-preflight": "true",
        },
        timeout: 30000,
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.signup;
    } catch (error) {
      console.error("Register error:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },
};
