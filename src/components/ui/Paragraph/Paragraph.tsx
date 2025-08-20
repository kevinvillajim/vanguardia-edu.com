export default function Paragraph({ p }) {
  return (
    <div className="w-full flex px-[2rem] py-[2rem]">
      <p className="font-righteous text-white font-ligth text-md text-left">
        {p}
      </p>
    </div>
  );
}
