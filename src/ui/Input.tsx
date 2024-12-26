

export function Input({ onChange, placeholder }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }) {
    return <div>
        <input onChange={onChange} className="py-1 px-2 border w-full" type="text" placeholder={placeholder} />
    </div>
}