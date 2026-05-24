import { login, register } from '@/features/auth/authSlice';
import {
  emailSchema,
  passwordSchema,
} from '@/features/auth/components/validation';
import { start } from '@/features/auth/confirmationSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { addToast, Button, Checkbox, Input, Link } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import React from 'react';
import {
  Controller,
  useForm,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type SubmitHandler,
} from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ConfirmBlock } from './ConfirmBlock';

/* ---------- constants ---------- */
const countryPhoneCodes = [
  { code: '+1', label: 'United States' },
  { code: '+44', label: 'United Kingdom' },
] as const;

/* ---------- schema ---------- */
const schema = z
  .object({
    fullName: z.string().min(2, 'Full name required'),

    email: emailSchema,

    phoneCode: z.enum(
      countryPhoneCodes.map((c) => c.code) as [string, ...string[]],
    ),

    phone: z.string().optional(),

    password: passwordSchema,

    confirmPassword: z.string(),

    accept: z.literal(true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const confirm = useAppSelector((s) => s.confirmation.flow === 'signup');
  const [step, setStep] = React.useState<'form' | 'code'>('form');

  const nextUrl = searchParams.get('next');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: '',
      // organization: "",
      email: '',
      phoneCode: '+1',
      phone: '',
      password: '',
      confirmPassword: '',
      accept: false,
    },
    resolver: zodResolver(schema),
  } as any); // keep cast for compatibility

  /* ---------- submit ---------- */
  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    try {
      await dispatch(
        register({ email: data.email, password: data.password }),
      ).unwrap();
      addToast({
        title: 'Account created',
        description: 'Check your inbox to verify your email.',
        color: 'success',
      });
      dispatch(start({ flow: 'signup', email: data.email }));
      setStep('code');
    } catch (e: any) {
      addToast({
        title: 'Registration failed',
        description: e.message ?? 'Unknown error',
        color: 'danger',
      });
    }
  };

  const handleCodeOk = async () => {
    const email = watch('email');
    const password = watch('password');
    try {
      await dispatch(login({ email, password })).unwrap();

      if (nextUrl) {
        navigate(decodeURIComponent(nextUrl));
      } else {
        // Let AuthBootstrap handle postAuth logic to avoid conflicts
        // Default navigation handled by PrivateRoute
      }
    } catch (e: any) {
      addToast({
        title: 'Login failed',
        description: e.message,
        color: 'danger',
      });
    }
  };

  if (step === 'code' && confirm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ConfirmBlock onSuccess={handleCodeOk} />
      </motion.div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="w-full max-w-md -mt-6">
      <div className="rounded-[32px] bg-white/80 p-7 backdrop-blur dark:bg-black/30">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10">
            <Icon icon="lucide:user-plus" className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-medium text-foreground">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-default-600">
            Sign up and start monitoring your data in minutes
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-4"
          autoComplete="on"
        >
          {/* Full name */}
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <Input
                {...field}
                label="Full Name"
                placeholder="John Doe"
                isRequired
                autoComplete="name"
                variant="bordered"
                validationState={errors.fullName ? 'invalid' : undefined}
                errorMessage={errors.fullName?.message}
                startContent={
                  <Icon
                    icon="lucide:user"
                    className="text-default-400"
                    width={20}
                  />
                }
                classNames={{ inputWrapper: 'bg-background/60 backdrop-blur' }}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                label="Email"
                placeholder="name@company.com"
                isRequired
                autoComplete="email"
                variant="bordered"
                validationState={errors.email ? 'invalid' : undefined}
                errorMessage={errors.email?.message}
                startContent={
                  <Icon
                    icon="lucide:mail"
                    className="text-default-400"
                    width={20}
                  />
                }
                classNames={{ inputWrapper: 'bg-background/60 backdrop-blur' }}
              />
            )}
          />

          {/* Passwords */}
          <PasswordInput
            control={control}
            name="password"
            label="Password"
            error={errors.password?.message}
          />
          <PasswordInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
          />

          {/* Terms */}
          <Controller
            control={control}
            name="accept"
            render={({ field }) => (
              <div className="flex items-start gap-3 mt-1 p">
                <Checkbox
                  className="translate-y-[2pt]"
                  isSelected={field.value as boolean}
                  onValueChange={field.onChange}
                  validationState={errors.accept ? 'invalid' : undefined}
                  aria-label="Accept terms"
                />

                {/* Clickable label (toggles checkbox), links do not toggle */}
                <div
                  className="text-m leading-5 text-default-600 select-none cursor-pointer"
                  onClick={() => field.onChange(!field.value)}
                >
                  I agree to the{' '}
                  <Link
                    as="a"
                    href="https://store.motionics.com/pages/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    // Stop the label toggle
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    as="a"
                    href="https://store.motionics.com/pages/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            )}
          />

          {/* Primary action */}
          <Button
            type="submit"
            color="primary"
            size="lg"
            className="mt-1 w-full font-medium"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>

          {/* Divider */}
          {/* <DividerWithText text="or continue with" /> */}

          {/* OAuth */}
          {/* <div className="flex gap-4">
            <OauthButton provider="google" />
            <OauthButton provider="microsoft" /> */}
          {/* </div> */}
        </form>
      </div>
    </div>
  );
}


/** Re-usable eye-toggle password field */
function PasswordInput<
  TFieldValues extends FormValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  error,
}: {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  error?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  const getAutoComplete = (fieldName: string) => {
    if (fieldName === 'password') return 'new-password';
    if (fieldName === 'confirmPassword') return 'new-password';
    return 'current-password';
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
      }) => (
        <Input
          {...field}
          name={name as string}
          value={(field?.value as string) ?? ''}
          type={visible ? 'text' : 'password'}
          label={label}
          placeholder={
            label === 'Password'
              ? 'Create a password'
              : 'Re-enter your password'
          }
          isRequired
          autoComplete={getAutoComplete(name as string)}
          variant="bordered"
          validationState={error ? 'invalid' : undefined}
          errorMessage={error}
          startContent={
            <Icon icon="lucide:lock" className="text-default-400" width={20} />
          }
          endContent={
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="rounded-md p-1 text-default-400 hover:text-default-600"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              <Icon
                icon={visible ? 'lucide:eye' : 'lucide:eye-off'}
                className="text-default-400"
                width={20}
              />
            </button>
          }
          classNames={{
            inputWrapper: 'bg-background/60 backdrop-blur',
          }}
        />
      )}
    />
  );
}
