import svgPaths from "./svg-c6hoatgm2s";

function Heading() {
  return (
    <div className="absolute h-[28.001px] left-[24.83px] top-[24.83px] w-[622.337px]" data-name="Heading 3">
      <p className="absolute font-['Barlow_Condensed:Bold',sans-serif] leading-[28px] left-0 not-italic text-[#f2f2f2] text-[18px] top-[-0.08px] tracking-[-0.45px] whitespace-nowrap">CRIAR NOVO PLANO</p>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Nome do Plano</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="bg-[#0d0d0d] h-[45.658px] relative rounded-[50px] shrink-0 w-full" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[14px] whitespace-nowrap">Ex: PREMIUM</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.995px] h-[73.646px] items-start left-0 top-0 w-[303.171px]" data-name="Container">
      <Label />
      <TextInput />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Preço Mensal</p>
    </div>
  );
}

function NumberInput() {
  return (
    <div className="absolute bg-[#0d0d0d] h-[45.658px] left-0 rounded-[50px] top-0 w-[303.171px]" data-name="Number Input">
      <div className="content-stretch flex items-center overflow-clip pl-[44px] pr-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[14px] whitespace-nowrap">0</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[12.83px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M10 1.66667V18.3333" id="Vector" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3055a600} id="Vector_2" stroke="var(--stroke-0, #606060)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[45.658px] relative shrink-0 w-full" data-name="Container">
      <NumberInput />
      <Icon />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.995px] h-[73.646px] items-start left-[319.17px] top-0 w-[303.171px]" data-name="Container">
      <Label1 />
      <Container4 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Descrição</p>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="bg-[#0d0d0d] h-[45.658px] relative rounded-[50px] shrink-0 w-full" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#606060] text-[14px] whitespace-nowrap">Breve descrição do plano</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.995px] h-[73.646px] items-start left-0 top-[89.64px] w-[622.337px]" data-name="Container">
      <Label2 />
      <TextInput1 />
    </div>
  );
}

function Checkbox() {
  return <div className="bg-[#0d0d0d] shrink-0 size-[15.996px]" data-name="Checkbox" />;
}

function Label3() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[219.974px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#f2f2f2] text-[14px] top-[0.25px] whitespace-nowrap">Marcar como plano em destaque</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[19.993px] items-center left-0 top-[179.28px] w-[622.337px]" data-name="Container">
      <Checkbox />
      <Label3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[199.277px] left-[24.83px] top-[68.83px] w-[622.337px]" data-name="Container">
      <Container2 />
      <Container3 />
      <Container5 />
      <Container6 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[45.671px] relative rounded-[50px] shrink-0 w-[118.04px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[59.33px] not-italic text-[#f2f2f2] text-[16px] text-center top-[9.92px] whitespace-nowrap">Cancelar</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[24px] size-[15.996px] top-[14.84px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
        <g id="Icon">
          <path d="M3.33252 7.99805H12.6636" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 3.33252V12.6636" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#00f9e4] h-[45.671px] relative rounded-[50px] shrink-0 w-[156.283px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[89.99px] not-italic text-[#0a0a0a] text-[16px] text-center top-[9.92px] whitespace-nowrap">Criar Plano</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex gap-[11.999px] h-[45.671px] items-start justify-end left-[24.83px] top-[292.1px] w-[622.337px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#1a1a1a] h-[362.604px] relative rounded-[10px] shrink-0 w-[671.999px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#303030] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading />
        <Container1 />
        <Container7 />
      </div>
    </div>
  );
}

export default function CriarPlano() {
  return (
    <div className="bg-black content-stretch flex items-center justify-center pl-[207.331px] pr-[207.337px] relative size-full" data-name="criar-plano">
      <Container />
    </div>
  );
}