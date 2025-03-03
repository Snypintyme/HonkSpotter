import { AuthForm } from '@/components/authForm';
import { AuthType } from '@/enums/authType';

interface AuthenticationProps {
  authType: AuthType;
}

const Authentication = ({ authType }: AuthenticationProps) => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthForm authType={authType} />
      </div>
    </div>
  );
};

export default Authentication;
