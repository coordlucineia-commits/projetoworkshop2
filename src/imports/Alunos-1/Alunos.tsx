import svgPaths from "./svg-p7uavo4ism";
import imgImageJoaoSilva from "./81e581e8bdbf8c9f2fa02e4c20dce774b1a1bb76.png";
import imgImageCarlosOliveira from "./4631e0b3856fc2d697783d063af0506770940150.png";
import imgImageMariaSantos from "./c370e1db29c9956574be3ed78df1b2c14bcdb239.png";
import imgImageAnaCosta from "./e243fca66b972890241de9a6542eedb4acdb0d0f.png";
import imgImageBeatrizLima from "./a8d9836506bb678008af0be8a848b247e3386b00.png";

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
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a8a8a8] text-[14px] whitespace-nowrap">Planos</p>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

function Dropdown() {
  return (
    <div className="absolute bg-[#1a1a1a] content-stretch flex flex-col h-[45.658px] items-start left-0 rounded-[10px] top-0 w-[114.922px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Option />
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

function Option1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Option">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a8a8a8] text-[14px] whitespace-nowrap">Mês</p>
          <ChevronDown1 />
        </div>
      </div>
    </div>
  );
}

function Dropdown1() {
  return (
    <div className="absolute bg-[#1a1a1a] content-stretch flex flex-col h-[45.658px] items-start left-[122.92px] rounded-[10px] top-0 w-[114.922px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Option1 />
    </div>
  );
}

function ChevronDown2() {
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

function Option2() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Option">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a8a8a8] text-[14px] whitespace-nowrap">Recentes</p>
          <ChevronDown2 />
        </div>
      </div>
    </div>
  );
}

function DatePicker() {
  return (
    <div className="absolute bg-[#1a1a1a] h-[46px] left-[246.17px] rounded-[10px] top-[-0.32px] w-[114px]" data-name="Date Picker">
      <div className="content-stretch flex items-start overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <Option2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[45.658px] left-0 top-[61.65px] w-[729.512px]" data-name="Container">
      <Dropdown />
      <Dropdown1 />
      <DatePicker />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#1a1a1a] h-[45.658px] left-0 rounded-[10px] top-0 w-[729.512px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[48px] pr-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[14px] whitespace-nowrap">Buscar aluno por nome, email ou telefone...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[16px] size-[20px] top-[12.83px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pcddfd00} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M17.5 17.5L13.9167 13.9167" id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[45.658px] left-0 top-0 w-[729.512px]" data-name="Container">
      <TextInput />
      <Icon />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[107.311px] relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
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

function Heading1() {
  return (
    <div className="absolute h-[24.004px] left-0 overflow-clip top-0 w-[78.724px]" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">João Silva</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] h-[19.993px] left-[86.72px] rounded-[4px] top-[2.01px] w-[47.995px]" data-name="Text">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] left-[6px] text-[#00f9e4] text-[12px] top-[2px] whitespace-nowrap">#5678</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[24.004px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Text />
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[64.805px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] whitespace-nowrap">Em atraso</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[15.996px] left-[76.8px] top-0 w-[6.751px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute h-[15.996px] left-[95.55px] overflow-clip top-0 w-[126.615px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">Cadastro: 09/03/2024</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Text1 />
      <Text2 />
      <Text3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[548.867_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Container7 />
        <Container8 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">BASIC</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[47.995px] items-center left-[16.83px] top-[16.83px] w-[667.858px]" data-name="Container">
      <ImageJoaoSilva />
      <Container6 />
      <Text4 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p11974af0} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute left-[692.68px] size-[20px] top-[27.57px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container5 />
      <Button />
    </div>
  );
}

function ImageCarlosOliveira() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Carlos Oliveira)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageCarlosOliveira} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[24.004px] left-0 overflow-clip top-0 w-[111.68px]" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Carlos Oliveira</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] h-[19.993px] left-[119.67px] rounded-[4px] top-[2.01px] w-[47.995px]" data-name="Text">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] left-[6px] text-[#00f9e4] text-[12px] top-[2px] whitespace-nowrap">#3456</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[24.004px] relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Text5 />
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[57.604px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#facc15] text-[12px] whitespace-nowrap">Vencendo</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[15.996px] left-[69.6px] top-0 w-[6.751px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute h-[15.996px] left-[88.35px] overflow-clip top-0 w-[121.361px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">Cadastro: 31/01/2024</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Text6 />
      <Text7 />
      <Text8 />
    </div>
  );
}

function Container11() {
  return (
    <div className="flex-[533.268_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Container12 />
        <Container13 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[54.603px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">PREMIUM</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[47.995px] items-center left-[16.83px] top-[16.83px] w-[667.858px]" data-name="Container">
      <ImageCarlosOliveira />
      <Container11 />
      <Text9 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p11974af0} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute left-[692.68px] size-[20px] top-[27.57px]" data-name="Button">
      <Icon2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container10 />
      <Button1 />
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
    <div className="absolute h-[24.004px] left-0 overflow-clip top-0 w-[100.007px]" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Maria Santos</p>
    </div>
  );
}

function Text10() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] h-[19.993px] left-[108px] rounded-[4px] top-[2.01px] w-[47.995px]" data-name="Text">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] left-[6px] text-[#00f9e4] text-[12px] top-[2px] whitespace-nowrap">#1234</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[24.004px] relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Text10 />
    </div>
  );
}

function Text11() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[43.203px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#4ade80] text-[12px] whitespace-nowrap">Em dia</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="absolute h-[15.996px] left-[55.2px] top-0 w-[6.751px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text13() {
  return (
    <div className="absolute h-[15.996px] left-[73.95px] overflow-clip top-0 w-[121.706px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">Cadastro: 14/01/2024</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Text11 />
      <Text12 />
      <Text13 />
    </div>
  );
}

function Container16() {
  return (
    <div className="flex-[533.268_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[54.603px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">PREMIUM</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[47.995px] items-center left-[16.83px] top-[16.83px] w-[667.858px]" data-name="Container">
      <ImageMariaSantos />
      <Container16 />
      <Text14 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p11974af0} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute left-[692.68px] size-[20px] top-[27.57px]" data-name="Button">
      <Icon3 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container15 />
      <Button2 />
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

function Heading4() {
  return (
    <div className="absolute h-[24.004px] left-0 overflow-clip top-0 w-[78.945px]" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Ana Costa</p>
    </div>
  );
}

function Text15() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] h-[19.993px] left-[86.94px] rounded-[4px] top-[2.01px] w-[47.995px]" data-name="Text">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] left-[6px] text-[#00f9e4] text-[12px] top-[2px] whitespace-nowrap">#9012</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[24.004px] relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <Text15 />
    </div>
  );
}

function Text16() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[43.203px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#4ade80] text-[12px] whitespace-nowrap">Em dia</p>
    </div>
  );
}

function Text17() {
  return (
    <div className="absolute h-[15.996px] left-[55.2px] top-0 w-[6.751px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text18() {
  return (
    <div className="absolute h-[15.996px] left-[73.95px] overflow-clip top-0 w-[118.548px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">Cadastro: 19/11/2023</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Text16 />
      <Text17 />
      <Text18 />
    </div>
  );
}

function Container21() {
  return (
    <div className="flex-[548.867_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Container22 />
        <Container23 />
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">ELITE</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[47.995px] items-center left-[16.83px] top-[16.83px] w-[667.858px]" data-name="Container">
      <ImageAnaCosta />
      <Container21 />
      <Text19 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p11974af0} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute left-[692.68px] size-[20px] top-[27.57px]" data-name="Button">
      <Icon4 />
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container20 />
      <Button3 />
    </div>
  );
}

function ImageBeatrizLima() {
  return (
    <div className="pointer-events-none relative rounded-[13981000px] shrink-0 size-[47.995px]" data-name="Image (Beatriz Lima)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover rounded-[13981000px] size-full" src={imgImageBeatrizLima} />
      <div aria-hidden="true" className="absolute border-[1.667px] border-[rgba(0,249,228,0.2)] border-solid inset-0 rounded-[13981000px]" />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute h-[24.004px] left-0 overflow-clip top-0 w-[94.518px]" data-name="Heading 4">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#f2f2f2] text-[16px] top-[-0.92px] whitespace-nowrap">Beatriz Lima</p>
    </div>
  );
}

function Text20() {
  return (
    <div className="absolute bg-[rgba(0,249,228,0.1)] h-[19.993px] left-[102.51px] rounded-[4px] top-[2.01px] w-[47.995px]" data-name="Text">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] left-[6px] text-[#00f9e4] text-[12px] top-[2px] whitespace-nowrap">#7890</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[24.004px] relative shrink-0 w-full" data-name="Container">
      <Heading5 />
      <Text20 />
    </div>
  );
}

function Text21() {
  return (
    <div className="absolute content-stretch flex h-[15.996px] items-start left-0 top-0 w-[64.805px]" data-name="Text">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#00f9e4] text-[12px] whitespace-nowrap">Em atraso</p>
    </div>
  );
}

function Text22() {
  return (
    <div className="absolute h-[15.996px] left-[76.8px] top-0 w-[6.751px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text23() {
  return (
    <div className="absolute h-[15.996px] left-[95.55px] overflow-clip top-0 w-[126.784px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#606060] text-[12px] top-[0.42px] whitespace-nowrap">Cadastro: 04/08/2023</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="Container">
      <Text21 />
      <Text22 />
      <Text23 />
    </div>
  );
}

function Container26() {
  return (
    <div className="flex-[548.867_0_0] h-[41.999px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Text24() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[39.004px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#606060] text-[12px] tracking-[0.6px] whitespace-nowrap">BASIC</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex gap-[15.996px] h-[47.995px] items-center left-[16.83px] top-[16.83px] w-[667.858px]" data-name="Container">
      <ImageBeatrizLima />
      <Container26 />
      <Text24 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p39a1e780} id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p11974af0} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p133c1580} id="Vector_3" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute left-[692.68px] size-[20px] top-[27.57px]" data-name="Button">
      <Icon5 />
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-[#1a1a1a] h-[81.654px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container25 />
      <Button4 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] h-[456.263px] items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <Container9 />
      <Container14 />
      <Container19 />
      <Container24 />
    </div>
  );
}

function MainContent() {
  return (
    <div className="bg-[#0d0d0d] h-[637.233px] relative rounded-[14px] shrink-0 w-full" data-name="Main Content">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="content-stretch flex flex-col gap-[23.997px] items-start pb-[0.833px] pt-[24.831px] px-[24.831px] relative size-full">
        <Container />
        <Container3 />
      </div>
    </div>
  );
}

function DashboardAdmin() {
  return (
    <div className="absolute bg-[#090909] content-stretch flex flex-col h-[823.333px] items-start left-0 pl-[287.995px] pr-[31.999px] pt-[112.832px] top-0 w-[1099.167px]" data-name="DashboardAdmin">
      <MainContent />
    </div>
  );
}

function DashboardAdmin1() {
  return <div className="absolute h-[823.333px] left-0 opacity-2 top-0 w-[1099.167px]" data-name="DashboardAdmin" />;
}

function Heading() {
  return (
    <div className="h-[31.992px] overflow-clip relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[32px] left-0 not-italic text-[#f2f2f2] text-[24px] top-[-0.75px] tracking-[-0.6px] whitespace-nowrap">ALUNOS</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[19.993px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[20px] left-0 text-[#606060] text-[14px] top-[-0.58px] whitespace-nowrap">GESTÃO COMPLETA DA BASE DE MEMBROS</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[51.986px] relative shrink-0 w-[285.605px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading />
        <Paragraph />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[51.986px] relative shrink-0 w-[404.876px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container30 />
      </div>
    </div>
  );
}

function Icon6() {
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

function Button5() {
  return (
    <div className="bg-[#1a1a1a] relative rounded-[50px] shrink-0 size-[41.667px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.833px] py-[0.833px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Icon7() {
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

function Button6() {
  return (
    <div className="bg-[#1a1a1a] h-[37.663px] relative rounded-[50px] shrink-0 w-[135.651px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon7 />
        <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] left-[79.82px] text-[#f2f2f2] text-[12px] text-center top-[10.83px] tracking-[0.6px] uppercase whitespace-nowrap">Novo Aluno</p>
      </div>
    </div>
  );
}

function Icon8() {
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

function Button7() {
  return (
    <div className="bg-[#00f9e4] h-[35.996px] relative rounded-[50px] shrink-0 w-[172.982px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon8 />
        <p className="-translate-x-1/2 absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[16px] left-[98.49px] text-[#0a0a0a] text-[12px] text-center top-[10px] tracking-[0.6px] uppercase whitespace-nowrap">Ativar Recepção</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[41.667px] relative shrink-0 w-[374.297px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center relative size-full">
        <Button5 />
        <Button6 />
        <Button7 />
      </div>
    </div>
  );
}

function DashboardAdmin2() {
  return (
    <div className="absolute bg-[rgba(13,13,13,0.8)] content-stretch flex h-[80px] items-center justify-between left-[256px] pb-[0.833px] px-[31.999px] top-0 w-[843.171px]" data-name="DashboardAdmin">
      <div aria-hidden="true" className="absolute border-b-[0.833px] border-black border-solid inset-0 pointer-events-none" />
      <Container29 />
      <Container31 />
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

function Text25() {
  return (
    <div className="absolute h-[27.995px] left-0 top-0 w-[71.504px]" data-name="Text">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#f2f2f2] text-[20px] top-[-0.33px] tracking-[-0.5px] whitespace-nowrap">LuTe</p>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[51.999px] relative shrink-0 w-[71.504px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text25 />
        <p className="absolute font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[15px] left-0 text-[#606060] text-[10px] top-[34.49px] tracking-[0.5px] whitespace-nowrap">ADMIN PANEL</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[80px] relative shrink-0 w-[255.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-b-[0.833px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center pb-[0.833px] pl-[23.997px] relative size-full">
        <Logo />
        <Container34 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p275d2400} id="Vector" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p21a7e80} id="Vector_2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[73.027px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[37px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Dashboard</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon9 />
          <Text26 />
        </div>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pae3c380} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text27() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[46.296px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[23px] not-italic text-[#0a0a0a] text-[14px] text-center top-[0.25px] whitespace-nowrap">Alunos</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[#00f9e4] h-[43.997px] relative rounded-[50px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon10 />
          <Text27 />
        </div>
      </div>
    </div>
  );
}

function Icon11() {
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

function Text28() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[68.092px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[34px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Check-ins</p>
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon11 />
          <Text28 />
        </div>
      </div>
    </div>
  );
}

function Icon12() {
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

function Text29() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[108.763px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[54.5px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Modo Recepção</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon12 />
          <Text29 />
        </div>
      </div>
    </div>
  );
}

function Icon13() {
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

function Text30() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[98.724px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[49.5px] not-italic text-[#a8a8a8] text-[14px] text-center top-[0.25px] whitespace-nowrap">Configurações</p>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="h-[43.997px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pl-[15.996px] relative size-full">
          <Icon13 />
          <Text30 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col h-[60.827px] items-start pt-[16.829px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-solid border-t-[0.833px] inset-0 pointer-events-none" />
      <Button12 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="flex-[618.516_0_0] min-h-px min-w-px relative w-[255.163px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start pt-[23.997px] px-[15.996px] relative size-full">
        <Button8 />
        <Button9 />
        <Button10 />
        <Button11 />
        <Container35 />
      </div>
    </div>
  );
}

function Icon14() {
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

function Container38() {
  return (
    <div className="bg-[rgba(0,249,228,0.1)] relative rounded-[13981000px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(0,249,228,0.2)] border-solid inset-0 pointer-events-none rounded-[13981000px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10px] py-[0.833px] relative size-full">
        <Icon14 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19.993px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Admin FORGEE</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex h-[15.996px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#606060] text-[12px]">GESTOR</p>
    </div>
  );
}

function Container39() {
  return (
    <div className="flex-[171.172_0_0] h-[35.99px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex gap-[11.999px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Icon15() {
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

function Button13() {
  return (
    <div className="h-[39.993px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <Icon15 />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[52.99px] not-italic text-[#a8a8a8] text-[14px] text-center top-[10.25px] whitespace-nowrap">Sair</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[124.818px] relative shrink-0 w-[255.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-solid border-t-[0.833px] inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[11.999px] items-start pt-[16.829px] px-[15.996px] relative size-full">
        <Container37 />
        <Button13 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="flex-[823.333_0_0] min-h-px min-w-px relative w-[255.163px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container33 />
        <Navigation />
        <Container36 />
      </div>
    </div>
  );
}

function DashboardAdmin3() {
  return (
    <div className="absolute bg-[rgba(13,13,13,0.5)] content-stretch flex flex-col h-[823.333px] items-start left-0 pr-[0.833px] top-0 w-[255.996px]" data-name="DashboardAdmin">
      <div aria-hidden="true" className="absolute border-[#303030] border-r-[0.833px] border-solid inset-0 pointer-events-none" />
      <Container32 />
    </div>
  );
}

export default function Alunos() {
  return (
    <div className="bg-white relative size-full" data-name="alunos">
      <DashboardAdmin />
      <DashboardAdmin1 />
      <DashboardAdmin2 />
      <DashboardAdmin3 />
    </div>
  );
}