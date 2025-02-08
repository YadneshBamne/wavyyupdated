import React from "react";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
import { WavveLogo } from "@/components/WavveLogo";
import one from "@/assets/one.png";
import two from "@/assets/two.svg";
import three from "@/assets/three.svg"

export function Login() {
  return (
    <main className="grid lg:grid-cols-2 min-h-screen">
      <div className="bg-[#F9F5FF]">
        <div className="p-6">
          <WavveLogo />
        </div>
        <div className="space-y-16 p-8">
          <div className="flex items-center space-x-4">
            <img
              src={one}
              alt="Feature One"
              className=""
            />
          </div>
          <div className="flex items-center space-x-4">
            <img
              src={two}
              alt="Feature Two"
              className=""
            />
          </div>
          <div className="flex items-center space-x-4">
            <img
              src={three}
              alt="Feature Three"
              className=""
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Wavve
            </h1>
            <p className="text-muted-foreground">
              Join us to streamline your salon operations effortlessly.
            </p>
          </div>
          <PhoneLoginForm />
        </div>
      </div>
    </main>
  );
}
