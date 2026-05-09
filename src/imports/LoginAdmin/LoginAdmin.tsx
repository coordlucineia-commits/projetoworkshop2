import svgPaths from "./svg-0ght666bo8";

function Lt() {
  return (
    <div className="absolute h-[14px] left-[9px] top-[9px] w-[14.275px]" data-name="LT">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.2751 14">
        <g id="LT">
          <path d={svgPaths.pf26f000} fill="var(--fill-0, #171717)" id="Vector" />
          <path d={svgPaths.p3d8dd180} fill="var(--fill-0, #171717)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="LOGO">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="absolute bg-[#00f9e4] left-0 rounded-[8px] size-[32px] top-0" />
        <Lt />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[32px] relative shrink-0 w-[40px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[32px] left-[19.67px] not-italic text-[#f2f2f2] text-[24px] text-center top-[-0.75px] tracking-[-0.6px] whitespace-nowrap">LuTe</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[32px] relative shrink-0 w-[94px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center relative size-full">
        <Logo />
        <Text />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="h-[63.997px] relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-b-[0.833px] border-black border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pb-[0.833px] px-[490.638px] relative size-full">
          <Button />
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[15.16px] size-[31.999px] top-[15.16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.9987 31.9987">
        <g id="Icon">
          <path d={svgPaths.pb057600} id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66656" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid left-[188px] rounded-[24px] size-[63.997px] top-0" data-name="Container">
      <Icon />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[48.001px] left-0 top-[79.99px] w-[440px]" data-name="Heading 1">
      <p className="-translate-x-1/2 absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[48px] left-[219.89px] not-italic text-[#f2f2f2] text-[48px] text-center top-0 tracking-[-1.2px] whitespace-nowrap">PAINEL ADMIN</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[48.008px] left-0 top-[139.99px] w-[440px]" data-name="Paragraph">
      <div className="-translate-x-1/2 absolute font-['Inter:Light',sans-serif] font-light leading-[0] left-[220px] not-italic text-[#a8a8a8] text-[16px] text-center top-[-0.92px] w-[440px] whitespace-pre-wrap">
        <p className="leading-[24px] mb-0">{`Acesso restrito ao sistema de gestão `}</p>
        <p className="leading-[24px] text-[#00f9e4]">PulseGym</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[188.001px] relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Heading />
      <Paragraph />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Label">
      <div className="content-stretch flex items-start px-[16px] relative size-full">
        <p className="flex-[1_0_0] font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] min-h-px min-w-px relative text-[#a8a8a8] text-[12px] tracking-[1.2px] uppercase">E-mail Administrativo</p>
      </div>
    </div>
  );
}

function EmailInput() {
  return (
    <div className="absolute bg-[#0d0d0d] h-[53.652px] left-0 rounded-[50px] top-0 w-[440px]" data-name="Email Input">
      <div className="content-stretch flex items-center overflow-clip pl-[48px] pr-[16px] py-[14px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[16px] whitespace-nowrap">admin@forgee.com</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[16.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 15">
            <path d={svgPaths.p2b3c0500} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%_45.85%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.68%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3335 6.66345">
            <path d={svgPaths.p38f0cf80} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16px] size-[20px] top-[16.82px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[53.652px] relative shrink-0 w-full" data-name="Container">
      <EmailInput />
      <Container6 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[7.995px] h-[77.643px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container5 />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex h-[15.996px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] min-h-px min-w-px relative text-[#a8a8a8] text-[12px] tracking-[1.2px] uppercase">Senha</p>
    </div>
  );
}

function PasswordInput() {
  return (
    <div className="absolute bg-[#0d0d0d] h-[53.652px] left-0 rounded-[50px] top-0 w-[440px]" data-name="Password Input">
      <div className="content-stretch flex items-center overflow-clip px-[48px] py-[14px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[16px] whitespace-nowrap">••••••••</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[45.83%_12.5%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-9.09%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 10.8333">
            <path d={svgPaths.p22c1500} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_29.17%_54.17%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-11.11%_-10%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 9.16667">
            <path d={svgPaths.p3e02e700} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16px] size-[20px] top-[16.82px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[20.84%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-7.14%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3342 13.3323">
            <path d={svgPaths.pcb0000} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.66667 6.66667">
            <path d={svgPaths.p2314a170} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[404px] size-[20px] top-[16.82px]" data-name="Button">
      <Icon3 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[53.652px] relative shrink-0 w-full" data-name="Container">
      <PasswordInput />
      <Container9 />
      <Button1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[7.995px] h-[77.643px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Container8 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[139.4px] size-[15.996px] top-[17.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g clipPath="url(#clip0_13_158)" id="Icon">
          <path d={svgPaths.p13d148f0} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_13_158">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#00f9e4] h-[51.986px] relative rounded-[50px] shrink-0 w-full" data-name="Button">
      <Icon4 />
      <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[20px] left-[232.39px] text-[#0a0a0a] text-[14px] text-center top-[15.41px] tracking-[1.4px] uppercase whitespace-nowrap">Acessar Painel</p>
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[23.997px] h-[255.267px] items-start relative shrink-0 w-full" data-name="Form">
      <Container4 />
      <Container7 />
      <Button2 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[440px]" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#606060] text-[12px] text-center tracking-[0.6px]">ACESSO EXCLUSIVO PARA ADMINISTRADORES</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[19.993px] left-[117.94px] top-[30.49px] w-[204.115px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[102.5px] not-italic text-[#606060] text-[14px] text-center top-[0.25px] whitespace-nowrap">← Voltar para homepage</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[51.999px] relative shrink-0 w-full" data-name="Container">
      <Paragraph1 />
      <Button3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[591.256px] relative shrink-0 w-[440px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[47.995px] items-start relative size-full">
        <Container2 />
        <Form />
        <Container10 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[759.329px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[323.333px] relative size-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function LoginAdmin1() {
  return (
    <div className="absolute bg-[#090909] content-stretch flex flex-col gap-[0.833px] h-[824.16px] items-start left-0 top-0 w-[1086.667px]" data-name="LoginAdmin">
      <Header />
      <Container />
    </div>
  );
}

function LoginAdmin2() {
  return <div className="absolute h-[823.333px] left-0 opacity-2 top-0 w-[1086.667px]" data-name="LoginAdmin" />;
}

function LoginAdmin3() {
  return <div className="-translate-x-1/2 absolute bg-gradient-to-t bottom-[0.67px] from-[rgba(0,249,228,0.05)] h-[127.995px] left-[calc(50%+0.33px)] to-[rgba(0,0,0,0)] w-[1086.667px]" data-name="LoginAdmin" />;
}

export default function LoginAdmin() {
  return (
    <div className="bg-white relative size-full" data-name="login-admin">
      <LoginAdmin1 />
      <LoginAdmin2 />
      <LoginAdmin3 />
    </div>
  );
}