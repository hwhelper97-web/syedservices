type Props = {
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({ placeholder, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
    />
  );
}