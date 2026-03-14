"use client"

import RegisterForm from '@/components/RegisterForm';
import Welcome from '@/components/Welcome'
import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const Register = () => {
  const searchParams = useSearchParams();
  const initialStep = (() => {
    const s = searchParams?.get('step');
    if (s) return Number(s) === 2 ? 2 : 1;
    const from = searchParams?.get('from');
    if (from === 'login') return 2;
    return 1;
  })();

  const [step,setStep]=useState<number>(initialStep);
  return (
    <div>
      {step===1 ? <Welcome nextStep={setStep} /> : <RegisterForm previousStep={setStep} />}
    </div>
  )
}

export default Register
 