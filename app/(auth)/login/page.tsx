import { LoginForm } from "@/components/auth/login-form";

const LoginPage = () => {
  return (
    <div className="w-full p-6 md:p-0">
      <div className="flex justify-center items-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;