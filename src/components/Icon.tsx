export default function Icon({ name, size, ...rest }: {name: string, size:number}) {
    return (
        <svg {...rest} width={size} height={size}>
            <use href={'#' + name}></use>
        </svg>
    );
}
