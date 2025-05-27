import React from 'react';
import { Github } from 'lucide-react';

interface SocialButtonProps {
  provider: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center w-full py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200"
    >
      {icon}
      <span className="ml-2 text-gray-700">
        Continue with {provider}
      </span>
    </button>
  );
};

const SocialLogin: React.FC = () => {
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className="space-y-3">
      <SocialButton
        provider="Google"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
            />
            <path
              fill="#34A853"
              d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
            />
            <path
              fill="#4A90E2"
              d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
            />
          </svg>
        }
        onClick={() => handleSocialLogin('Google')}
      />
      
      <SocialButton
        provider="Apple"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.0748 11.3315C17.0511 8.58151 19.3681 7.27929 19.4665 7.21635C18.0474 5.12505 15.8934 4.84451 15.1203 4.82247C13.2369 4.62591 11.4215 5.95645 10.4643 5.95645C9.48083 5.95645 8.00026 4.84451 6.39346 4.8792C4.31352 4.91357 2.37326 6.15777 1.30744 8.05735C-0.943339 11.9339 0.84351 17.6664 3.01246 20.3724C4.08362 21.6978 5.34504 23.184 6.95451 23.1161C8.5235 23.0406 9.10442 22.0638 10.9951 22.0638C12.8637 22.0638 13.4078 23.1161 15.0548 23.0704C16.7471 23.0406 17.8435 21.7228 18.8677 20.3876C20.0874 18.8527 20.5858 17.3407 20.6094 17.2655C20.5703 17.2503 17.1061 15.8287 17.0748 11.3315Z" />
            <path d="M14.2201 3.44591C15.0924 2.39215 15.68 0.990461 15.5207 0C14.3007 0.0533683 12.8039 0.824652 11.8994 1.85532C11.1041 2.76288 10.3873 4.22223 10.57 5.16768C11.9348 5.26603 13.3175 4.48657 14.2201 3.44591Z" />
          </svg>
        }
        onClick={() => handleSocialLogin('Apple')}
      />
      
      <SocialButton
        provider="GitHub"
        icon={<Github className="w-5 h-5" />}
        onClick={() => handleSocialLogin('GitHub')}
      />
    </div>
  );
};

export default SocialLogin;