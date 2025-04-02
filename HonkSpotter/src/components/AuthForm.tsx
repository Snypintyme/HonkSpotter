import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthType } from '@/enums/authType';
import apiClient from '@/api/apiClient';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthResponse } from '@/interfaces/auth';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { useSnackbar } from 'notistack';
import { useNavigate } from '@tanstack/react-router';

interface AuthFormProps extends React.ComponentProps<'div'> {
  authType: AuthType;
}

interface FormValues {
  email: string;
  password: string;
}

export function AuthForm({ authType, className, ...props }: AuthFormProps) {
  const { setAccessToken } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const mutation = useMutation<AuthResponse, Error, FormValues>({
    mutationFn: async (credentials: FormValues) => {
      if (authType === AuthType.Login) {
        const response = await apiClient.post(ApiEndpoints.Login, credentials, {
          withCredentials: true,
        });
        return response.data;
      } else {
        const response = await apiClient.post(ApiEndpoints.Signup, credentials, {
          withCredentials: true,
        });
        return response.data;
      }
    },
    onSuccess: (data) => {
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      navigate({ to: '/' });
      console.log(`${authType === AuthType.Login ? 'Login' : 'Signup'} successful`, data);
    },
    onError: (error) => {
      const message = error.message;
      const responseData = (error as any).response?.data;
      
      if (responseData?.msg?.includes('Account locked until')) {
        enqueueSnackbar(responseData.msg, { 
          variant: 'warning',
          autoHideDuration: 10000
        });
      } 
      else {
        enqueueSnackbar(`Error: ${message}`, { variant: 'error' });
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-1">
            {authType === AuthType.Login ? 'Welcome quack! 🪿' : 'Goose to meet you! 🦢'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">
                  {errors.email ? errors.email.message : <span className="invisible">placeholder</span>}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Please enter your password',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    validate: (value) => {
                      return [
                        /[A-Z]/.test(value),
                        /[a-z]/.test(value),
                        /[0-9]/.test(value),
                        /[^A-Za-z0-9]/.test(value)
                      ].filter(Boolean).length >= 4 || 
                      'Password must include at least one of each: uppercase, lowercase, number, special character'
                    }
                  })}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">
                  {errors.password ? errors.password.message : <span className="invisible">placeholder</span>}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  {authType === AuthType.Login ? 'Login' : 'Sign Up'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {authType === AuthType.Login ? `Don't have an account? ` : `Already have an account? `}
              <a href={authType === AuthType.Login ? '/signup' : '/login'} className="underline underline-offset-4">
                {authType === AuthType.Login ? 'Sign Up' : 'Login'}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

