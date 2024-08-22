import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../../../stores/useSession";
import { postLoginFn } from "../../../api/auth";
import { useState } from "react";
import { useRef } from "react";

import Input from "../../ui/input/Input";
import InvalidFeedback from "../../ui/InvalidFeedback/InvalidFeedback";

import "./Login.css";

const CAPTCHA_KEY = import.meta.env.VITE_CAPTCHA_KEY;

const LoginForm = () => {
  const [captcha, setCaptcha] = useState(null);
  const captchaRef = useRef(null);
  // ---------------------------------------------
  // Zustand
  // ---------------------------------------------

  const { login } = useSession();

  // ---------------------------------------------
  // RRD
  // ---------------------------------------------

  const navigate = useNavigate();

  // ---------------------------------------------
  // RHF
  // ---------------------------------------------

  const {
    register,
    handleSubmit: onSubmitRHF,
    formState: { errors },
    reset,
  } = useForm();

  // ---------------------------------------------
  // RQ
  // ---------------------------------------------

  const { mutate: postLogin } = useMutation({
    mutationFn: postLoginFn,
    onSuccess: (userData) => {
      console.log(userData);
      toast.dismiss();
      toast.success(`Bienvenido, ${userData.fullname}`);

      reset();

      login(userData);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (e) => {
      toast.dismiss();
      toast.warning(e.message);
    },
  });

  // ---------------------------------------------
  // HANDLERS
  // ---------------------------------------------

  const handleSubmit = (data) => {
    if (!captchaRef.current.getValue()) {
      setCaptcha(true);
      return;
    }

    setCaptcha(false);

    toast.loading("Cargando...");
    postLogin(data);
  };

  // ---------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------

  const handleCaptchaChange = () => {
    if (!captchaRef.current.getValue()) {
      setCaptcha(true);
      return;
    }

    setCaptcha(false);
  };

  return (
    <form
      onSubmit={onSubmitRHF(handleSubmit)}
      className="custom-form container"
    >
      <Input
        className="mb-3"
        error={errors.usernameOrEmail}
        label="CORREO ELECTRONICO"
        name="usernameOrEmail"
        options={{
          required: {
            value: true,
            message: "Este campo es requerido",
          },
          minLength: 3,
          maxLength: 50,
        }}
        inputClassName="custom-input"
        labelClassName="custom-label"
        register={register}
      />
      <Input
        error={errors.password}
        label="CONTRASEÑA"
        name="password"
        options={{
          required: {
            value: true,
            message: "Este campo es requerido",
          },
          minLength: 3,
          maxLength: 20,
        }}
        inputClassName="custom-input"
        labelClassName="custom-label"
        register={register}
        type="password"
      />
      <section className="d-flex flex-column align-items-center mt-2">
        {captcha && (
          <InvalidFeedback
            noInput={true}
            divClass="text-center mb-2"
            msg="El Captcha debe ser resuelto para poder enviar un mail"
          />
        )}
        <ReCAPTCHA
          ref={captchaRef}
          onChange={handleCaptchaChange}
          sitekey={CAPTCHA_KEY}
        />
      </section>
      <div className="text-center mt-3">
        <button className="custom-btn" type="submit">
          Ingresar
        </button>
      </div>
      <p className="account-question">
        ¿Aun no tienes cuenta?{" "}
        <Link to="/register" className="register-link">
          Ingresá aqui
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
