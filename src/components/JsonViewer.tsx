import {useEffect, useRef, useState} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import JsonViewer from '../utils/json-viewer/json-viewer.js';

export default function JsonViewerComponent({data}: { data: string }) {

    const localRef = useRef<HTMLDivElement>(null)

    const [isJson, setIsJson] = useState<boolean>(false)
    useEffect(() => {
        if (data) {
            console.log(data)
            try {
                const _data = JSON.parse(data)
                new JsonViewer(_data, localRef.current)
                setIsJson(true)
            } catch {
                if (localRef.current) {
                    localRef.current.innerHTML = data;
                }
            }
        }
    }, [data])
    return (
        <div className={isJson ? "bg-black bg-opacity-90 rounded-md p-3": "hidden"}>
            <div ref={localRef}></div>
        </div>
    );
}
