import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        name
        email
        role
        profileImageUrl
        points
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
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
