export const ChartTitle = (props:{
    title: string
    color: string
    position: string
}) => {
    return <div className={`flex items-center ${props.position} gap-1`}>
        <div className={`w-[12px] h-[12px] rounded-full ${props.color}`}></div>
        <div className="text-[12px]">{props.title}</div>
    </div>
}