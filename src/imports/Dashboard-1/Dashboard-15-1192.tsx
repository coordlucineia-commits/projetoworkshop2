import svgPaths from "./svg-7a6aaiue0r";
import imgImageMariaSantos from "./c370e1db29c9956574be3ed78df1b2c14bcdb239.png";
import imgImageJoaoSilva from "./81e581e8bdbf8c9f2fa02e4c20dce774b1a1bb76.png";
import imgImageAnaCosta from "./e243fca66b972890241de9a6542eedb4acdb0d0f.png";
import imgImagePedroAlves from "./4631e0b3856fc2d697783d063af0506770940150.png";
import imgImageCarlaSouza from "./a8d9836506bb678008af0be8a848b247e3386b00.png";
import { imgGroup, imgGroup1 } from "./svg-0zvvc";

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g clipPath="url(#clip0_15_622)" id="Icon">
          <path d={svgPaths.p2fa9fb00} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_15_622">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron-down">
          <path d="M6 9L12 15L18 9" id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Option() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Option">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a8a8a8] text-[14px] whitespace-nowrap">Mês</p>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

function Option1() {
  return <div className="h-0 shrink-0 w-full" data-name="Option" />;
}

function Option2() {
  return <div className="h-0 shrink-0 w-full" data-name="Option" />;
}

function Option3() {
  return <div className="h-0 shrink-0 w-full" data-name="Option" />;
}

function Dropdown() {
  return (
    <div className="bg-[#1a1a1a] h-[36.406px] relative rounded-[50px] shrink-0 w-[133.997px]" data-name="Dropdown">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Option />
        <Option1 />
        <Option2 />
        <Option3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[36.406px] items-center left-0 top-0 w-[157.988px]" data-name="Container">
      <Icon />
      <Dropdown />
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron-down">
          <path d="M6 9L12 15L18 9" id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Option4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Option">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a8a8a8] text-[14px] whitespace-nowrap">Ativos</p>
          <ChevronDown1 />
        </div>
      </div>
    </div>
  );
}

function Dropdown1() {
  return (
    <div className="bg-[#1a1a1a] flex-[1_0_0] h-[36.406px] min-h-px min-w-px relative rounded-[50px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Option4 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[36.406px] items-center left-[173.98px] top-0 w-[136.081px]" data-name="Container">
      <Dropdown1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[36.406px] left-[287.99px] top-[112.83px] w-[766.673px]" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 6.66667">
            <path d={svgPaths.p6877e0} id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 8.33333">
            <path d={svgPaths.p3ffa2780} id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[63.04%_8.33%_12.5%_79.17%]" data-name="Vector">
        <div className="absolute inset-[-17.04%_-33.33%_-17.04%_-33.34%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.16687 6.55854">
            <path d={svgPaths.p39df7200} id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[13.04%_20.8%_54.67%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-12.91%_-33.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.1734 8.1254">
            <path d={svgPaths.p159fd500} id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(74,222,128,0.1)] relative rounded-[10px] shrink-0 size-[37.656px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(74,222,128,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.833px] pt-[8.828px] px-[8.828px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[46.803px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">ATIVOS</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex h-[37.656px] items-center justify-between left-[24px] top-[24px] w-[130.007px]" data-name="Container">
      <Container6 />
      <Text />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[40px] relative shrink-0 w-[49.036px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">248</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-start left-[24px] top-[77.65px] w-[130.007px]" data-name="Container">
      <Text1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[19.993px] left-[24px] top-[121.65px] w-[130.007px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] whitespace-nowrap">Alunos ativos</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[187.298px] left-0 rounded-[14px] top-0 w-[179.668px]" data-name="Container">
      <Container5 />
      <Container7 />
      <Paragraph />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 6.66667">
            <path d={svgPaths.p6877e0} id="Vector" stroke="var(--stroke-0, #FACC15)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 8.33333">
            <path d={svgPaths.p3ffa2780} id="Vector" stroke="var(--stroke-0, #FACC15)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[33.33%_8.33%_45.83%_70.83%]" data-name="Vector">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.83333 5.83333">
            <path d="M0.833333 0.833333L5 5" id="Vector" stroke="var(--stroke-0, #FACC15)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[33.33%_8.33%_45.83%_70.83%]" data-name="Vector">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.83333 5.83333">
            <path d="M5 0.833333L0.833333 5" id="Vector" stroke="var(--stroke-0, #FACC15)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(250,204,21,0.1)] relative rounded-[10px] shrink-0 size-[37.656px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(250,204,21,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.833px] pt-[8.828px] px-[8.828px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[62.402px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">INATIVOS</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex h-[37.656px] items-center justify-between left-[24px] top-[24px] w-[130.013px]" data-name="Container">
      <Container10 />
      <Text2 />
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32.077px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">20</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-start left-[24px] top-[77.65px] w-[130.013px]" data-name="Container">
      <Text3 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[39.987px] left-[24px] top-[121.65px] w-[130.013px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] w-[131px]">12 pausados, 8 cancelados</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[187.298px] left-[195.66px] rounded-[14px] top-0 w-[179.674px]" data-name="Container">
      <Container9 />
      <Container11 />
      <Paragraph1 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 6.66667">
            <path d={svgPaths.p6877e0} id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 8.33333">
            <path d={svgPaths.p3ffa2780} id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_8.33%_45.83%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-25%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.66667 5">
            <path d={svgPaths.p184c5900} id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[rgba(232,39,26,0.1)] relative rounded-[10px] shrink-0 size-[37.656px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.833px] pt-[8.828px] px-[8.828px] relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[31.204px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">HOJE</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex h-[37.656px] items-center justify-between left-[24px] top-[24px] w-[130.007px]" data-name="Container">
      <Container14 />
      <Text4 />
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[40px] relative shrink-0 w-[30.495px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">87</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-start left-[24px] top-[77.65px] w-[130.007px]" data-name="Container">
      <Text5 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[19.993px] left-[24px] top-[121.65px] w-[130.007px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] whitespace-nowrap">Check-ins hoje</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[187.298px] left-[391.33px] rounded-[14px] top-0 w-[179.668px]" data-name="Container">
      <Container13 />
      <Container15 />
      <Paragraph2 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-10%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 10">
            <path d={svgPaths.p1f5e580} id="Vector" stroke="var(--stroke-0, #8B5CF6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%_45.83%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.66667 6.66667">
            <path d={svgPaths.p26fac1f0} id="Vector" stroke="var(--stroke-0, #8B5CF6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-[rgba(139,92,246,0.1)] relative rounded-[10px] shrink-0 size-[37.656px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(139,92,246,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.833px] pt-[8.828px] px-[8.828px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[78.001px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">FREQUÊNCIA</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex h-[37.656px] items-center justify-between left-[24px] top-[24px] w-[130.013px]" data-name="Container">
      <Container18 />
      <Text6 />
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[41.152px]" data-name="Text">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">3.4</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute h-[24.004px] left-[49.15px] top-[16.67px] w-[46.289px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#606060] text-[16px] top-[-0.92px] whitespace-nowrap">x/sem</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[40.671px] left-[24px] top-[77.65px] w-[130.013px]" data-name="Container">
      <Text7 />
      <Text8 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[19.993px] left-[24px] top-[122.32px] w-[130.013px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] whitespace-nowrap">Média semanal</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[187.298px] left-[587px] rounded-[14px] top-0 w-[179.674px]" data-name="Container">
      <Container17 />
      <Container19 />
      <Paragraph3 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
            <path d={svgPaths.p147ca400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-1/2 right-1/2 top-[33.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.66667 5">
            <path d="M0.833333 0.833333V4.16667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[33.33%] left-1/2 right-[49.96%] top-[66.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.675 1.66667">
            <path d="M0.833333 0.833333H0.841667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#00f9e4] relative rounded-[10px] shrink-0 size-[35.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[7.995px] px-[7.995px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[12.689px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="flex-[1_0_0] font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] min-h-px min-w-px relative text-[#00f9e4] text-[12px] tracking-[0.6px]">🕶️</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex h-[35.99px] items-center justify-between left-[24px] top-[24px] w-[130.007px]" data-name="Container">
      <Container22 />
      <Text9 />
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[40px] relative shrink-0 w-[26.029px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">15</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-start left-[24px] top-[75.98px] w-[130.007px]" data-name="Container">
      <Text10 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[39.987px] left-[24px] opacity-80 top-[119.98px] w-[130.007px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] w-[131px]">Turistas 10+ dias sem check-in</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute border-[0.833px] border-[rgba(0,249,228,0.3)] border-solid h-[185.632px] left-0 rounded-[14px] top-[203.29px] w-[179.668px]" data-name="Container" style={{ backgroundImage: "linear-gradient(134.065deg, rgba(0, 249, 228, 0.2) 0%, rgba(0, 249, 228, 0.05) 100%)" }}>
      <Container21 />
      <Container23 />
      <Paragraph4 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 6.66667">
            <path d={svgPaths.p6877e0} id="Vector" stroke="var(--stroke-0, #06B6D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 8.33333">
            <path d={svgPaths.p3ffa2780} id="Vector" stroke="var(--stroke-0, #06B6D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[33.33%_20.83%_41.67%_79.17%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.66667 6.66667">
            <path d="M0.833333 0.833333V5.83333" id="Vector" stroke="var(--stroke-0, #06B6D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_8.33%_54.17%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.66667 1.66667">
            <path d="M5.83333 0.833333H0.833333" id="Vector" stroke="var(--stroke-0, #06B6D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-[rgba(6,182,212,0.1)] relative rounded-[10px] shrink-0 size-[37.656px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(6,182,212,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.833px] pt-[8.828px] px-[8.828px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">NOVOS</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex h-[37.656px] items-center justify-between left-[24px] top-[24px] w-[130.013px]" data-name="Container">
      <Container26 />
      <Text11 />
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[40px] relative shrink-0 w-[31.465px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[40px] left-0 not-italic text-[#f2f2f2] text-[36px] top-[0.33px] whitespace-nowrap">23</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-start left-[24px] top-[77.65px] w-[130.013px]" data-name="Container">
      <Text12 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[19.993px] left-[24px] top-[121.65px] w-[130.013px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] whitespace-nowrap">Novos este mês</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[185.632px] left-[195.66px] rounded-[14px] top-[203.29px] w-[179.674px]" data-name="Container">
      <Container25 />
      <Container27 />
      <Paragraph5 />
    </div>
  );
}

function Container28() {
  return <div className="absolute h-[185.632px] left-[391.33px] top-[203.29px] w-[179.668px]" data-name="Container" />;
}

function Container29() {
  return <div className="absolute h-[185.632px] left-[587px] top-[203.29px] w-[179.674px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="absolute h-[388.926px] left-[287.99px] top-[173.24px] w-[766.673px]" data-name="Container">
      <Container4 />
      <Container8 />
      <Container12 />
      <Container16 />
      <Container20 />
      <Container24 />
      <Container28 />
      <Container29 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex h-[35.996px] items-start relative shrink-0 w-full" data-name="Heading 5">
      <p className="flex-[1_0_0] font-['Barlow_Condensed:Bold',sans-serif] leading-[36px] min-h-px min-w-px not-italic relative text-[#f2f2f2] text-[30px] tracking-[-0.75px]">+328 MEMBROS</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a8a8a8] text-[14px] top-[0.25px] whitespace-nowrap">Crescimento nos últimos 12 meses</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.997px] h-[59.987px] items-start left-0 top-0 w-[229.043px]" data-name="Container">
      <Heading4 />
      <Paragraph6 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3c797180} id="Vector" stroke="var(--stroke-0, #22C55E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3ac0b600} id="Vector_2" stroke="var(--stroke-0, #22C55E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[40.43px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#22c55e] text-[14px] top-[0.25px] whitespace-nowrap">+24%</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute bg-[rgba(34,197,94,0.1)] content-stretch flex gap-[3.997px] h-[27.995px] items-center left-[632.58px] pl-[10px] rounded-[10px] top-0 w-[84.427px]" data-name="Container">
      <Icon7 />
      <Text13 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[59.987px] left-[24px] top-[24px] w-[717.012px]" data-name="Container">
      <Container32 />
      <Container33 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[2%_0.7%_14%_2.09%]" data-name="Group">
      <div className="absolute inset-[-0.24%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 696.999 211">
          <g id="Group">
            <path d="M0 210.5H696.999" id="Vector" stroke="var(--stroke-0, #303030)" strokeDasharray="3 3" strokeWidth="0.999998" />
            <path d="M0 158H696.999" id="Vector_2" stroke="var(--stroke-0, #303030)" strokeDasharray="3 3" strokeWidth="0.999998" />
            <path d="M0 105.5H696.999" id="Vector_3" stroke="var(--stroke-0, #303030)" strokeDasharray="3 3" strokeWidth="0.999998" />
            <path d="M0 53H696.999" id="Vector_4" stroke="var(--stroke-0, #303030)" strokeDasharray="3 3" strokeWidth="0.999998" />
            <path d="M0 0.499999H696.999" id="Vector_5" stroke="var(--stroke-0, #303030)" strokeDasharray="3 3" strokeWidth="0.999998" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[2%_0.7%_14%_2.09%]" data-name="Group">
      <Group1 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[87.81%_86.42%_6.19%_8.28%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_86.42%_6.19%_8.28%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Abr 25</p>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[87.81%_77.51%_6.19%_17.05%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_77.51%_6.19%_17.05%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Mai 25</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-[87.81%_68.68%_6.19%_25.88%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_68.68%_6.19%_25.88%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Jun 25</p>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[87.81%_60.12%_6.19%_35%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_60.12%_6.19%_35%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Jul 25</p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[87.81%_50.86%_6.19%_43.42%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_50.86%_6.19%_43.42%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Ago 25</p>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents inset-[87.81%_42.3%_6.19%_52.54%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_42.3%_6.19%_52.54%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Set 25</p>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents inset-[87.81%_33.33%_6.19%_61.23%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_33.33%_6.19%_61.23%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Out 25</p>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents inset-[87.81%_24.35%_6.19%_69.93%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_24.35%_6.19%_69.93%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Nov 25</p>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents inset-[87.81%_15.51%_6.19%_78.77%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_15.51%_6.19%_78.77%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Dez 25</p>
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents inset-[87.81%_6.82%_6.19%_87.75%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_6.82%_6.19%_87.75%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Jan 26</p>
    </div>
  );
}

function Group14() {
  return (
    <div className="absolute contents inset-[87.81%_-0.04%_6.19%_94.6%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[87.81%_-0.04%_6.19%_94.6%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-center whitespace-nowrap">Fev 26</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[87.81%_-0.04%_6.19%_8.28%]" data-name="Group">
      <Group4 />
      <Group5 />
      <Group6 />
      <Group7 />
      <Group8 />
      <Group9 />
      <Group10 />
      <Group11 />
      <Group12 />
      <Group13 />
      <Group14 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[86%_-0.04%_6.19%_2.09%]" data-name="Group">
      <div className="absolute inset-[86%_0.7%_14%_2.09%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 696.999 0.999998">
            <path d="M0 0.499999H696.999" id="Vector" stroke="var(--stroke-0, #303030)" strokeWidth="0.999998" />
          </svg>
        </div>
      </div>
      <Group3 />
    </div>
  );
}

function Group17() {
  return (
    <div className="absolute contents inset-[82.9%_99.02%_11.1%_-0.14%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[82.9%_99.02%_11.1%_-0.14%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-right whitespace-nowrap">0</p>
    </div>
  );
}

function Group18() {
  return (
    <div className="absolute contents inset-[61.9%_99.02%_32.1%_-0.84%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[61.9%_99.02%_32.1%_-0.84%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-right whitespace-nowrap">15</p>
    </div>
  );
}

function Group19() {
  return (
    <div className="absolute contents inset-[40.9%_99.02%_53.1%_-1.26%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[40.9%_99.02%_53.1%_-1.26%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-right whitespace-nowrap">30</p>
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute contents inset-[19.9%_99.02%_74.1%_-1.12%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[19.9%_99.02%_74.1%_-1.12%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-right whitespace-nowrap">45</p>
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute contents inset-[0.5%_99.02%_93.5%_-1.12%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[0.5%_99.02%_93.5%_-1.12%] leading-[normal] not-italic text-[#a8a8a8] text-[12px] text-right whitespace-nowrap">60</p>
    </div>
  );
}

function Group16() {
  return (
    <div className="absolute contents inset-[0.5%_99.02%_11.1%_-1.26%]" data-name="Group">
      <Group17 />
      <Group18 />
      <Group19 />
      <Group20 />
      <Group21 />
    </div>
  );
}

function Group15() {
  return (
    <div className="absolute contents inset-[0.5%_97.91%_11.1%_-1.26%]" data-name="Group">
      <div className="absolute inset-[2%_97.91%_14%_2.09%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999998 210">
            <path d="M0.499999 0V210" id="Vector" stroke="var(--stroke-0, #303030)" strokeWidth="0.999998" />
          </svg>
        </div>
      </div>
      <Group16 />
    </div>
  );
}

function Group25() {
  return (
    <div className="absolute inset-[18.8%_0.7%_14%_2.09%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-47px] mask-size-[696.999px_218px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <div className="absolute inset-[-0.89%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 697.566 169.5">
          <g id="Group">
            <path d={svgPaths.p30a36e00} fill="url(#paint0_linear_15_573)" id="Vector" />
            <path d={svgPaths.p3ec80480} id="Vector_2" stroke="var(--stroke-0, #00F9E4)" strokeWidth="2.99999" />
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_573" x1="0.36184" x2="0.36184" y1="1.5" y2="169.5">
              <stop stopColor="#00F9E4" stopOpacity="0.4" />
              <stop offset="0.95" stopColor="#00F9E4" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Group24() {
  return (
    <div className="absolute contents inset-[18.8%_0.7%_14%_2.09%]" data-name="Group">
      <Group25 />
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-[0_0.7%_12.8%_2.09%]" data-name="Clip path group">
      <Group24 />
    </div>
  );
}

function Group23() {
  return (
    <div className="absolute contents inset-[0_0.7%_12.8%_2.09%]" data-name="Group">
      <ClipPathGroup />
    </div>
  );
}

function Group26() {
  return (
    <div className="absolute inset-[16.8%_0_44.2%_1.39%]" data-name="Group">
      <div className="absolute inset-[-1.03%_-0.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 708.999 99.4998">
          <g id="Group">
            <path d={svgPaths.p2c24e100} fill="var(--fill-0, #00F9E4)" id="Vector" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p3f1c470} fill="var(--fill-0, #00F9E4)" id="Vector_2" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p17ac4380} fill="var(--fill-0, #00F9E4)" id="Vector_3" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p1cc14200} fill="var(--fill-0, #00F9E4)" id="Vector_4" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p1c981300} fill="var(--fill-0, #00F9E4)" id="Vector_5" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p2713a000} fill="var(--fill-0, #00F9E4)" id="Vector_6" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p1fc8c810} fill="var(--fill-0, #00F9E4)" id="Vector_7" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.pc555b00} fill="var(--fill-0, #00F9E4)" id="Vector_8" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p3d6f2900} fill="var(--fill-0, #00F9E4)" id="Vector_9" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p1d0e2d80} fill="var(--fill-0, #00F9E4)" id="Vector_10" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.p1cb07f00} fill="var(--fill-0, #00F9E4)" id="Vector_11" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
            <path d={svgPaths.pb587bc0} fill="var(--fill-0, #00F9E4)" id="Vector_12" stroke="var(--stroke-0, #0D0D0D)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group22() {
  return (
    <div className="absolute contents inset-[0_0_12.8%_1.39%]" data-name="Group">
      <Group23 />
      <Group26 />
    </div>
  );
}

function Group30() {
  return (
    <div className="absolute inset-[18.8%_0.7%_14%_2.09%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-47px] mask-size-[696.999px_217px]" data-name="Group" style={{ maskImage: `url('${imgGroup1}')` }}>
      <div className="absolute inset-[-0.6%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 697.377 169">
          <g id="Group">
            <path d={svgPaths.p50d500} fill="url(#paint0_linear_15_569)" id="Vector" />
            <path d={svgPaths.p18c25000} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeDasharray="5 5" strokeWidth="2" />
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_569" x1="0.241227" x2="0.241227" y1="0.999998" y2="169">
              <stop stopColor="#606060" stopOpacity="0.3" />
              <stop offset="0.95" stopColor="#606060" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Group29() {
  return (
    <div className="absolute contents inset-[18.8%_0.7%_14%_2.09%]" data-name="Group">
      <Group30 />
    </div>
  );
}

function ClipPathGroup1() {
  return (
    <div className="absolute contents inset-[0_0.7%_13.2%_2.09%]" data-name="Clip path group">
      <Group29 />
    </div>
  );
}

function Group28() {
  return (
    <div className="absolute contents inset-[0_0.7%_13.2%_2.09%]" data-name="Group">
      <ClipPathGroup1 />
    </div>
  );
}

function Group31() {
  return (
    <div className="absolute inset-[17.2%_0.14%_44.6%_1.53%]" data-name="Group">
      <div className="absolute inset-[-1.05%_-0.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 706.999 97.4998">
          <g id="Group">
            <path d={svgPaths.p1f6c6400} fill="var(--fill-0, #606060)" id="Vector" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p1567ab00} fill="var(--fill-0, #606060)" id="Vector_2" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p31f07440} fill="var(--fill-0, #606060)" id="Vector_3" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p1f93700} fill="var(--fill-0, #606060)" id="Vector_4" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p156f4100} fill="var(--fill-0, #606060)" id="Vector_5" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p381c180} fill="var(--fill-0, #606060)" id="Vector_6" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p1ffa2180} fill="var(--fill-0, #606060)" id="Vector_7" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.pa6f5580} fill="var(--fill-0, #606060)" id="Vector_8" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p2d763080} fill="var(--fill-0, #606060)" id="Vector_9" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p1d8f6580} fill="var(--fill-0, #606060)" id="Vector_10" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p3efa5400} fill="var(--fill-0, #606060)" id="Vector_11" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
            <path d={svgPaths.p3c7f6780} fill="var(--fill-0, #606060)" id="Vector_12" stroke="var(--stroke-0, #0D0D0D)" strokeDasharray="5 5" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group27() {
  return (
    <div className="absolute contents inset-[0_0.14%_13.2%_1.53%]" data-name="Group">
      <Group28 />
      <Group31 />
    </div>
  );
}

function Surface() {
  return (
    <div className="absolute h-[250px] left-0 overflow-clip top-0 w-[716.999px]" data-name="Surface">
      <Group />
      <Group2 />
      <Group15 />
      <Group22 />
      <Group27 />
    </div>
  );
}

function AreaChart() {
  return (
    <div className="absolute h-[250px] left-[24px] top-[131.98px] w-[716.999px]" data-name="AreaChart">
      <Surface />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[122.67px] size-[15.996px] top-[2px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d={svgPaths.p1a395280} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[138.665px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[58px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Últimos 12 meses</p>
        <Icon8 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[169.45px] size-[15.996px] top-[10.83px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d="M3.33252 7.99805H12.6636" id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p31213900} id="Vector_2" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[37.65px] relative rounded-[10px] shrink-0 w-[196.283px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.33px] not-italic text-[#00f9e4] text-[14px] text-center top-[9.08px] whitespace-nowrap">Ver todos os membros</p>
        <Icon9 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute content-stretch flex h-[37.65px] items-center justify-between left-0 top-[24px] w-[717.012px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute border-[#303030] border-solid border-t-[0.833px] h-[62.48px] left-[24px] top-[405.98px] w-[717.012px]" data-name="Container">
      <Container35 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute bg-[#0d0d0d] border-[#303030] border-[0.833px] border-solid h-[494.121px] left-[287.99px] rounded-[14px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[594.16px] w-[766.673px]" data-name="Container">
      <Container31 />
      <AreaChart />
      <Container34 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[27.995px] relative shrink-0 w-[126.243px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#f2f2f2] text-[20px] top-[-0.33px] tracking-[-0.5px] whitespace-nowrap">ALUNOS RECENTES</p>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-[72.27px] size-[15.996px] top-[2px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d={svgPaths.p3e8435c0} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[88.268px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[32.5px] not-italic text-[#606060] text-[14px] text-center top-[0.25px] whitespace-nowrap">Ver todos</p>
        <Icon10 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex h-[27.995px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button2 />
    </div>
  );
}

function ImageMariaSantos() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Maria Santos)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageMariaSantos} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[24.004px] overflow-clip relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Maria Santos</p>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[43.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#4ade80] text-[12px] whitespace-nowrap">Em dia</p>
      </div>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[6.751px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
      </div>
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[65.436px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">1 hora atrás</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[15.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text14 />
      <Text15 />
      <Text16 />
    </div>
  );
}

function Container42() {
  return (
    <div className="flex-[254.544_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Heading3 />
        <Container43 />
      </div>
    </div>
  );
}

function Text17() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[54.603px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">PREMIUM</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[47.995px] relative shrink-0 w-[389.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative size-full">
        <ImageMariaSantos />
        <Container42 />
        <Text17 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.829px] py-[0.833px] relative size-full">
          <Container41 />
          <Icon11 />
        </div>
      </div>
    </div>
  );
}

function ImageJoaoSilva() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (João Silva)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageJoaoSilva} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[24.004px] overflow-clip relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">João Silva</p>
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[57.604px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#facc15] text-[12px] whitespace-nowrap">Vencendo</p>
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[6.751px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
      </div>
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[74.297px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">3 horas atrás</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[15.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text18 />
      <Text19 />
      <Text20 />
    </div>
  );
}

function Container46() {
  return (
    <div className="flex-[270.143_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Heading5 />
        <Container47 />
      </div>
    </div>
  );
}

function Text21() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">BASIC</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[47.995px] relative shrink-0 w-[389.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative size-full">
        <ImageJoaoSilva />
        <Container46 />
        <Text21 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.829px] py-[0.833px] relative size-full">
          <Container45 />
          <Icon12 />
        </div>
      </div>
    </div>
  );
}

function ImageAnaCosta() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Ana Costa)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageAnaCosta} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[24.004px] overflow-clip relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Ana Costa</p>
    </div>
  );
}

function Text22() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[64.805px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] whitespace-nowrap">Em atraso</p>
      </div>
    </div>
  );
}

function Text23() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[6.751px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
      </div>
    </div>
  );
}

function Text24() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[65.651px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">2 dias atrás</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[15.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text22 />
      <Text23 />
      <Text24 />
    </div>
  );
}

function Container50() {
  return (
    <div className="flex-[270.143_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Heading6 />
        <Container51 />
      </div>
    </div>
  );
}

function Text25() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">ELITE</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[47.995px] relative shrink-0 w-[389.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative size-full">
        <ImageAnaCosta />
        <Container50 />
        <Text25 />
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container48() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.829px] py-[0.833px] relative size-full">
          <Container49 />
          <Icon13 />
        </div>
      </div>
    </div>
  );
}

function ImagePedroAlves() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Pedro Alves)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImagePedroAlves} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading7() {
  return (
    <div className="h-[24.004px] overflow-clip relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Pedro Alves</p>
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[43.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#4ade80] text-[12px] whitespace-nowrap">Em dia</p>
      </div>
    </div>
  );
}

function Text27() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[6.751px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
      </div>
    </div>
  );
}

function Text28() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[74.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">5 horas atrás</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[15.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text26 />
      <Text27 />
      <Text28 />
    </div>
  );
}

function Container54() {
  return (
    <div className="flex-[254.544_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Heading7 />
        <Container55 />
      </div>
    </div>
  );
}

function Text29() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[54.603px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">PREMIUM</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[47.995px] relative shrink-0 w-[389.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative size-full">
        <ImagePedroAlves />
        <Container54 />
        <Text29 />
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container52() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.829px] py-[0.833px] relative size-full">
          <Container53 />
          <Icon14 />
        </div>
      </div>
    </div>
  );
}

function ImageCarlaSouza() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Carla Souza)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageCarlaSouza} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading8() {
  return (
    <div className="h-[24.004px] overflow-clip relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Carla Souza</p>
    </div>
  );
}

function Text30() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[43.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#4ade80] text-[12px] whitespace-nowrap">Em dia</p>
      </div>
    </div>
  );
}

function Text31() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[6.751px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
      </div>
    </div>
  );
}

function Text32() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[70.332px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">15 dias atrás</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[15.996px] items-center relative shrink-0 w-full" data-name="Container">
      <Text30 />
      <Text31 />
      <Text32 />
    </div>
  );
}

function Container58() {
  return (
    <div className="flex-[270.143_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Heading8 />
        <Container59 />
      </div>
    </div>
  );
}

function Text33() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">BASIC</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[47.995px] relative shrink-0 w-[389.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative size-full">
        <ImageCarlaSouza />
        <Container58 />
        <Text33 />
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container56() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.829px] py-[0.833px] relative size-full">
          <Container57 />
          <Icon15 />
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] h-[456.263px] items-start relative shrink-0 w-full" data-name="Container">
      <Container40 />
      <Container44 />
      <Container48 />
      <Container52 />
      <Container56 />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-[#0d0d0d] content-stretch flex flex-col gap-[23.997px] h-[557.917px] items-start left-0 pb-[0.833px] pt-[24.831px] px-[24.831px] rounded-[14px] top-0 w-[500.449px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container38 />
      <Container39 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
            <path d={svgPaths.p147ca400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-1/2 right-1/2 top-[33.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.66667 5">
            <path d="M0.833333 0.833333V4.16667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[33.33%] left-1/2 right-[49.96%] top-[66.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.675 1.66667">
            <path d="M0.833333 0.833333H0.841667" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="bg-[#00f9e4] relative rounded-[10px] shrink-0 size-[35.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[7.995px] px-[7.995px] relative size-full">
        <Icon16 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[28.001px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#f2f2f2] text-[18px] top-[-0.08px] tracking-[-0.45px] whitespace-nowrap">TURISTAS 🕶️</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[31.992px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a8a8a8] text-[12px] top-[0.42px] w-[137px]">Sem check-in há 10+ dias</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="flex-[1_0_0] h-[59.993px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading2 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex gap-[11.999px] h-[59.993px] items-center left-[24px] top-[24px] w-[184.564px]" data-name="Container">
      <Container62 />
      <Container63 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[94.408px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Lucas Martins</p>
      </div>
    </div>
  );
}

function Text34() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[54.603px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] tracking-[0.6px] whitespace-nowrap">PREMIUM</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Heading9 />
        <Text34 />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a8a8a8] text-[12px] top-[0.42px] whitespace-nowrap">Último check-in: 12 dias</p>
    </div>
  );
}

function Container65() {
  return (
    <div className="bg-[rgba(13,13,13,0.5)] h-[77.643px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="content-stretch flex flex-col gap-[7.995px] items-start pb-[0.833px] pt-[16.829px] px-[16.829px] relative size-full">
        <Container66 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Heading10() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[98.516px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Fernanda Lima</p>
      </div>
    </div>
  );
}

function Text35() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] tracking-[0.6px] whitespace-nowrap">BASIC</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex h-[19.993px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading10 />
      <Text35 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a8a8a8] text-[12px] top-[0.42px] whitespace-nowrap">Último check-in: 14 dias</p>
    </div>
  );
}

function Container67() {
  return (
    <div className="bg-[rgba(13,13,13,0.5)] h-[77.643px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="content-stretch flex flex-col gap-[7.995px] items-start pb-[0.833px] pt-[16.829px] px-[16.829px] relative size-full">
        <Container68 />
        <Paragraph9 />
      </div>
    </div>
  );
}

function Heading11() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[100.059px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Roberto Carlos</p>
      </div>
    </div>
  );
}

function Text36() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] tracking-[0.6px] whitespace-nowrap">ELITE</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex h-[19.993px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading11 />
      <Text36 />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a8a8a8] text-[12px] top-[0.42px] whitespace-nowrap">Último check-in: 18 dias</p>
    </div>
  );
}

function Container69() {
  return (
    <div className="bg-[rgba(13,13,13,0.5)] h-[77.643px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="content-stretch flex flex-col gap-[7.995px] items-start pb-[0.833px] pt-[16.829px] px-[16.829px] relative size-full">
        <Container70 />
        <Paragraph10 />
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.999px] h-[256.927px] items-start left-[24px] top-[107.99px] w-[184.564px]" data-name="Container">
      <Container65 />
      <Container67 />
      <Container69 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[19.993px] left-[24px] top-[380.91px] w-[184.564px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[93px] not-italic text-[#00f9e4] text-[14px] text-center top-[0.25px] whitespace-nowrap">Ver todos os 15 turistas →</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute border-[0.833px] border-[rgba(0,249,228,0.3)] border-solid h-[428.079px] left-[532.45px] rounded-[14px] top-0 w-[234.225px]" data-name="Container" style={{ backgroundImage: "linear-gradient(118.685deg, rgba(0, 249, 228, 0.1) 0%, rgba(0, 249, 228, 0.05) 100%)" }}>
      <Container61 />
      <Container64 />
      <Button3 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute h-[557.917px] left-[287.99px] top-[1120.28px] w-[766.673px]" data-name="Container">
      <Container37 />
      <Container60 />
    </div>
  );
}

function DashboardAdmin() {
  return (
    <div className="absolute bg-[#090909] h-[1710.195px] left-0 top-0 w-[1086.667px]" data-name="DashboardAdmin">
      <Container />
      <Container3 />
      <Container30 />
      <Container36 />
    </div>
  );
}

function DashboardAdmin1() {
  return <div className="absolute h-[823.333px] left-0 opacity-2 top-0 w-[1086.667px]" data-name="DashboardAdmin" />;
}

function Heading() {
  return (
    <div className="h-[31.992px] overflow-clip relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[32px] left-0 not-italic text-[#f2f2f2] text-[24px] top-[-0.75px] tracking-[-0.6px] whitespace-nowrap">DASHBOARD</p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[19.993px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-0 text-[#606060] text-[14px] top-[-0.58px] whitespace-nowrap">VISÃO GERAL — DOMINGO, 22 FEV 2026</p>
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[51.986px] relative shrink-0 w-[285.605px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading />
        <Paragraph11 />
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[51.986px] relative shrink-0 w-[392.376px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container72 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_15_579)" id="Icon">
          <path d={svgPaths.p20d10600} id="Vector" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 1.66667V3.33333" id="Vector_2" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 16.6667V18.3333" id="Vector_3" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2561cd80} id="Vector_4" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1a2cf7c0} id="Vector_5" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M1.66667 10H3.33333" id="Vector_6" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M16.6667 10H18.3333" id="Vector_7" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3d0afd40} id="Vector_8" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p18688e80} id="Vector_9" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_15_579">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#1a1a1a] relative rounded-[50px] shrink-0 size-[41.667px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.833px] py-[0.833px] relative size-full">
        <Icon17 />
      </div>
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[16.83px] size-[15.996px] top-[10.83px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g clipPath="url(#clip0_15_560)" id="Icon">
          <path d={svgPaths.p35b0d2a} id="Vector" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p39ddd00} id="Vector_2" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M12.6636 5.33203V9.33105" id="Vector_3" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M14.6631 7.33154H10.6641" id="Vector_4" stroke="var(--stroke-0, #F2F2F2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_15_560">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#1a1a1a] h-[37.663px] relative rounded-[50px] shrink-0 w-[135.651px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon18 />
        <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] left-[79.82px] text-[#f2f2f2] text-[12px] text-center top-[10.83px] tracking-[0.6px] uppercase whitespace-nowrap">Novo Aluno</p>
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-[16px] size-[15.996px] top-[10px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d={svgPaths.p24c17980} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p1fdb9800} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p4091c80} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.pddb39a0} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M13.9966 13.9966V14.0032" id="Vector_5" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p25a6ff80} id="Vector_6" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M1.99951 7.99805H2.00618" id="Vector_7" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 1.99951H8.00471" id="Vector_8" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 10.6641V10.6707" id="Vector_9" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 7.99805H11.3306" id="Vector_10" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M13.9966 7.99805V8.00471" id="Vector_11" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 13.9966V13.3301" id="Vector_12" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#00f9e4] h-[35.996px] relative rounded-[50px] shrink-0 w-[172.982px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon19 />
        <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] left-[98.49px] text-[#0a0a0a] text-[12px] text-center top-[10px] tracking-[0.6px] uppercase whitespace-nowrap">Ativar Recepção</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[41.667px] relative shrink-0 w-[374.297px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center relative size-full">
        <Button4 />
        <Button5 />
        <Button6 />
      </div>
    </div>
  );
}

function DashboardAdmin2() {
  return (
    <div className="absolute bg-[rgba(13,13,13,0.8)] content-stretch flex h-[80px] items-center justify-between left-[256px] pb-[0.833px] px-[31.999px] top-0 w-[830.671px]" data-name="DashboardAdmin">
      <div aria-hidden="true" className="absolute border-b-[0.833px] border-black border-solid inset-0 pointer-events-none" />
      <Container71 />
      <Container73 />
    </div>
  );
}

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

function Text37() {
  return (
    <div className="absolute h-[27.995px] left-0 top-0 w-[71.504px]" data-name="Text">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#f2f2f2] text-[20px] top-[-0.33px] tracking-[-0.5px] whitespace-nowrap">LuTe</p>
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[51.999px] relative shrink-0 w-[71.504px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text37 />
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[15px] left-0 text-[#606060] text-[10px] top-[34.49px] tracking-[0.5px] whitespace-nowrap">ADMIN PANEL</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[80px] relative shrink-0 w-[255.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-b-[0.833px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center pb-[0.833px] pl-[23.997px] relative size-full">
        <Logo />
        <Container76 />
      </div>
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p275d2400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p21a7e80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text38() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[73.027px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[37px] not-italic text-[#0a0a0a] text-[14px] text-center top-[0.25px] whitespace-nowrap">Dashboard</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#00f9e4] h-[43.997px] relative rounded-[50px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon20 />
          <Text38 />
        </div>
      </div>
    </div>
  );
}

function Icon21() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pae3c380} id="Vector_4" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text39() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[46.296px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[23px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Alunos</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon21 />
          <Text39 />
        </div>
      </div>
    </div>
  );
}

function Icon22() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2f5eb900} id="Vector_3" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text40() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[68.092px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[34px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Check-ins</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon22 />
          <Text40 />
        </div>
      </div>
    </div>
  );
}

function Icon23() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p1a0498d0} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p32f09b80} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1f77fe00} id="Vector_3" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p752a300} id="Vector_4" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M17.5 17.5V17.5083" id="Vector_5" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p8257960} id="Vector_6" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 10H2.50833" id="Vector_7" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 2.5H10.0083" id="Vector_8" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 13.3333V13.3417" id="Vector_9" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 10H14.1667" id="Vector_10" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M17.5 10V10.0083" id="Vector_11" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 17.5V16.6667" id="Vector_12" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text41() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[108.763px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[54.5px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Modo Recepção</p>
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon23 />
          <Text41 />
        </div>
      </div>
    </div>
  );
}

function Icon24() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.ped54800} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3b27f100} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text42() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[98.724px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[49.5px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Configurações</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon24 />
          <Text42 />
        </div>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col h-[60.827px] items-start pt-[16.829px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-solid border-t-[0.833px] inset-0 pointer-events-none" />
      <Button11 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="flex-[618.516_0_0] min-h-px min-w-px relative w-[255.163px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start pt-[23.997px] px-[15.996px] relative size-full">
        <Button7 />
        <Button8 />
        <Button9 />
        <Button10 />
        <Container77 />
      </div>
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25fc4100} id="Vector" stroke="var(--stroke-0, #00F9E4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container80() {
  return (
    <div className="bg-[rgba(0,249,228,0.1)] relative rounded-[13981000px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[13981000px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10px] py-[0.833px] relative size-full">
        <Icon25 />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[19.993px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Admin LuTe</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="content-stretch flex h-[15.996px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#606060] text-[12px]">GESTOR</p>
    </div>
  );
}

function Container81() {
  return (
    <div className="flex-[171.172_0_0] h-[35.99px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph12 />
        <Paragraph13 />
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <Container80 />
      <Container81 />
    </div>
  );
}

function Icon26() {
  return (
    <div className="absolute left-[16px] size-[15.996px] top-[12px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d={svgPaths.p1cbdbbc0} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p29861180} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M13.9966 7.99805H5.99854" id="Vector_3" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="h-[39.993px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <Icon26 />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[52.99px] not-italic text-[#a8a8a8] text-[14px] text-center top-[10.25px] whitespace-nowrap">Sair</p>
    </div>
  );
}

function Container78() {
  return (
    <div className="h-[124.818px] relative shrink-0 w-[255.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-solid border-t-[0.833px] inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[11.999px] items-start pt-[16.829px] px-[15.996px] relative size-full">
        <Container79 />
        <Button12 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="flex-[823.333_0_0] min-h-px min-w-px relative w-[255.163px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container75 />
        <Navigation />
        <Container78 />
      </div>
    </div>
  );
}

function DashboardAdmin3() {
  return (
    <div className="absolute bg-[rgba(13,13,13,0.5)] content-stretch flex flex-col h-[823.333px] items-start left-0 pr-[0.833px] top-0 w-[255.996px]" data-name="DashboardAdmin">
      <div aria-hidden="true" className="absolute border-[#303030] border-r-[0.833px] border-solid inset-0 pointer-events-none" />
      <Container74 />
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="bg-white relative size-full" data-name="dashboard">
      <DashboardAdmin />
      <DashboardAdmin1 />
      <DashboardAdmin2 />
      <DashboardAdmin3 />
    </div>
  );
}