import { apolloClient } from "../apollo";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  LOGIN_MUTATION_WITH_VARIABLES,
} from "../graphql/mutation";
import axios from "axios";
import {
  LoginInput,
  RegisterInput,
  AuthResponse,
  User,
} from "../../types/auth";
import { gql } from "@apollo/client";

const API_URL = "http://192.168.9.93:3000/graphql";

export const authService = {
  async login({ email, password }: LoginInput) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION_WITH_VARIABLES,
        variables: {
          email,
          password,
        },
      });

      console.log("Apollo Login Response:", data);

      return data.login;
    } catch (error) {
      console.error("authService login error:", error);
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
  async getAllCoursesWithoutTeacherName() {
    try {
      const GET_ALL_COURSES_SAFE = gql`
        query GetAllCourses {
          courses {
            _id
            title
            description
            courseImageUrl
            teacher {
              _id
              # Don't request name field to avoid the error
            }
            createdAt
            updatedAt
          }
        }
      `;

      const { data } = await apolloClient.query({
        query: GET_ALL_COURSES_SAFE,
        fetchPolicy: "network-only",
      });

      return data.courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },
};
