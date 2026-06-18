import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import logoUrl from "@/assets/logo.png";

import { AuthLayout } from "@/components/vocera/AuthLayout";
import { Button } from "@/components/vocera/Button";
import { Field } from "@/components/vocera/Field";
import { GoogleIcon } from "@/components/vocera/GoogleIcon";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "อีเมลไม่ถูกต้อง" }).max(255),
  password: z.string().min(8, { message: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }).max(128),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(1, { message: "กรุณากรอกชื่อ-นามสกุล" }).max(100),
    orgName: z.string().trim().min(1, { message: "กรุณากรอกชื่อองค์กร" }).max(200),
    email: z.string().trim().email({ message: "อีเมลไม่ถูกต้อง" }).max(255),
    password: z.string().min(8, { message: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }).max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

interface AuthCardProps {
  mode: Mode;
}

export function AuthCard({ mode }: AuthCardProps) {
  return (
    <AuthLayout>
      <Header />
      <Tabs mode={mode} />
      <div className="mt-6">{mode === "login" ? <LoginForm /> : <RegisterForm />}</div>
    </AuthLayout>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <img src={logoUrl} alt="Ringo" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-bold text-brand-700">Ringo</span>
      </div>
      <p className="text-center text-sm text-gray-500">
        เปลี่ยนงานโทรยืนยันแบบเดิม ให้เป็นระบบอัตโนมัติ
      </p>
    </div>
  );
}

function Tabs({ mode }: { mode: Mode }) {
  const item = (active: boolean) =>
    cn(
      "flex-1 py-3 text-center text-sm transition-colors",
      active
        ? "border-b-2 border-brand-700 font-semibold text-brand-700"
        : "border-b-2 border-transparent text-gray-400 hover:text-gray-600",
    );

  return (
    <div className="mt-6 flex border-b border-gray-100">
      <Link to="/login" className={item(mode === "login")}>
        เข้าสู่ระบบ
      </Link>
      <Link to="/register" className={item(mode === "register")}>
        สมัครสมาชิก
      </Link>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">หรือ</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full justify-center gap-2"
      onClick={handleGoogleAuth}
    >
      <GoogleIcon />
      {label}
    </Button>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setAuthError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    navigate({ to: "/dashboard" });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="อีเมล"
        type="email"
        autoComplete="email"
        placeholder="อีเมลของคุณ"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="รหัสผ่าน"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      {authError && <p className="text-sm text-red-600">{authError}</p>}
      <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full justify-center">
        {isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </Button>
      <Divider />
      <GoogleButton label="เข้าสู่ระบบด้วย Google" />
    </form>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", orgName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ org_name: values.orgName })
        .eq("id", data.user.id);
    }
    if (data.session) {
      navigate({ to: "/dashboard" });
    } else {
      setEmailSent(true);
    }
  });

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✉️
        </div>
        <p className="font-semibold text-gray-800">ยืนยันอีเมลของคุณ</p>
        <p className="text-sm text-gray-500">
          เราส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบและกดลิงก์เพื่อเข้าสู่ระบบ
        </p>
        <Link to="/login" className="text-sm font-medium text-brand-700 hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="ชื่อ-นามสกุล"
        placeholder="ชื่อและนามสกุล"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Field
        label="ชื่อองค์กร"
        placeholder="เช่น บริษัท ABC จำกัด"
        autoComplete="organization"
        error={errors.orgName?.message}
        {...register("orgName")}
      />
      <Field
        label="อีเมล"
        type="email"
        autoComplete="email"
        placeholder="อีเมลของคุณ"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="รหัสผ่าน"
        type="password"
        autoComplete="new-password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        label="ยืนยันรหัสผ่าน"
        type="password"
        autoComplete="new-password"
        placeholder="พิมพ์รหัสผ่านอีกครั้ง"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {authError && <p className="text-sm text-red-600">{authError}</p>}
      <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full justify-center">
        {isSubmitting ? "กำลังสมัครสมาชิก…" : "สมัครสมาชิก"}
      </Button>
      <Divider />
      <GoogleButton label="เข้าสู่ระบบด้วย Google" />
    </form>
  );
}

export default AuthCard;
