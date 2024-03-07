import FileHandleIDB from "../db/FileHandleIDB";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button, Dropdown} from "flowbite-react";
import Icon from "../components/Icon";
import dayjs from "dayjs";
import noop from "../utils/noop";
import {Levels} from "../interfaces/Levels";
import {Line} from "../interfaces/Line";

function IndexView() {

    const levels:Levels = {
        DEBUG: '#696969',
        INFO: '#4169E1',
        WARNING: '#FFA500',
        ERROR: '#d63e48',
        CRITICAL: '#4B0082'
    }
    const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[]>([])
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
    const [lines, setLines] = useState<Line[]>([])
    const [watch, setWatch] = useState<boolean>(false)
    const [watchInterval, setWatchInterval] = useState<NodeJS.Timeout | null>(null)
    const dropZone = useRef<HTMLDivElement>(null)
    // const [watchLastModified, setWatchLastModified] = useState<number|null>(null)
    let watchLastModified: null | number = null;
    useEffect(() => {
        (async () => {
            const fileHandleIDB = await FileHandleIDB;
            const fileHandles = await fileHandleIDB.all();
            setFileHandles(fileHandles)
        })()

    }, [])

    async function reloadHandle(fileHandle: FileSystemFileHandle) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await fileHandle.requestPermission({mode: 'read'})
        const file = await fileHandle.getFile();
        if (!watchLastModified || file.lastModified > watchLastModified) {
            // setWatchLastModified(file.lastModified)
            watchLastModified = file.lastModified
            void readFile(fileHandle)
        } else {
            console.log("No reload.")
        }
    }

     async function createFileHandle(_fileHandle?: FileSystemFileHandle):Promise<void> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const localFileHandle = _fileHandle || (await window.showOpenFilePicker())[0];
        const fileHandleIDB = await FileHandleIDB;
        fileHandleIDB.update(`fileHandle-${Date.now()}`, localFileHandle);
        void readFile(localFileHandle)
    }

    async function readFile(fileHandle: FileSystemFileHandle) {
        const file = await fileHandle.getFile();
        setFileHandle(fileHandle)
        const linesFound = []
        const linesToRead = 30
        console.log("Chargement du fichier...")
        const text = await file.text();
        console.log("Récupération des 30 dernières lignes...")
        const lines = text.split('\n');
        const regexp = new RegExp('^\\[(?<date>[^\\]]+)\\] (?<message>.+)', '')
        for (let i = lines.length - 1; i >= (lines.length - 1 - linesToRead); i--) {
            if (!lines[i]) {
                continue;
            }
            const parsedLine = regexp.exec(lines[i].toString().trim())
            const line:Line = {
                level: 'DEBUG',
                raw: lines[i],
                date: parsedLine?.groups?.date,
                message: parsedLine?.groups?.message
            }
            for (const level of Object.keys(levels)) {
                if (lines[i].includes(level)) {
                    line.level = level as keyof Levels;
                }
            }
            linesFound.push(line);
        }
        setLines(linesFound)
    }

    async function watchHandle() {
        setWatch(prevState => !prevState)
    }

    useEffect(() => {
        if (!fileHandle) {
            return;
        }
        if (watch) {
            console.log("watching...")
            setWatchInterval(setInterval(() => {
                console.log("watching: reload")
                reloadHandle(fileHandle).then(noop)
            }, 3000))
        } else {
            console.log("watching : clear")
            if (watchInterval) {
                clearInterval(watchInterval)
                setWatchInterval(null)
            }
        }
    }, [watch])

    const onDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (dropZone.current) {
            dropZone.current.classList.add('opacity-30')
        }
        const items = event.dataTransfer.items;
        if (items.length > 0 && items[0].kind === 'file') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const _fileHandle = await items[0].getAsFileSystemHandle();
            void createFileHandle(_fileHandle);
        }
    }, []);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (dropZone.current) {
            dropZone.current.classList.remove('opacity-30')
        }
    }, []);
    return (
        <>
            <header
                className="flex px-6  justify-center bg-white  w-full border-b border-gray-100 text-2xl tracking-wide font-light items-center">
                <div className="w-1/3">
                </div>
                <div className="w-1/3 flex items-center justify-center">
                    <img src={'logo.png'} className={"h-8"}/>
                    <div className={"ml-1.5"}>mini<span className={"font-bold"}
                                                        style={{fontFamily: "Asap"}}>logviewer</span></div>

                </div>
                <div className="w-1/3 text-xs gap-3 items-center justify-end flex">
                    <Dropdown size={"xs"} label="Open a log file" dismissOnClick={false}>
                        <Dropdown.Item onClick={()=>{
                            void createFileHandle()
                        }}>Open a new log file</Dropdown.Item>
                        <Dropdown.Divider/>

                        {fileHandles.map((fileHandle) => (
                            <Dropdown.Item onClick={() => {
                                void reloadHandle(fileHandle)
                            }}>{fileHandle.name}</Dropdown.Item>
                        ))}
                    </Dropdown>
                    or
                    <div
                        ref={dropZone}
                        className={`hover:animate-pulse opacity-30 text-xs border-black  border-2 border-dashed font-bold p-1.5 rounded-md`}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        Drop your file here
                    </div>

                </div>
            </header>
            <main className={"py-6 flex flex-col"}>
                {fileHandle && (
                    <div className="w-3/4 mx-auto shrink-0 font-light text-sm gap-3 pb-6 flex justify-end">
                        <div className="flex items-center bg-white px-3 border-gray-200 rounded-md border gap-1.5">
                            <Icon name={"textbook"} size={16}></Icon>
                            Current file :
                            <div className="font-medium ">
                                {fileHandle?.name}
                            </div>
                        </div>
                        <Button color={'light'} size={"xs"} onClick={watchHandle}>
                            {watch ? (<>
                                    <Icon name={"eyeoff"} size={16}></Icon>&nbsp;
                                    Unwatch file
                                </>) :
                                (<>
                                    <Icon name={"eye"} size={16}></Icon>&nbsp;
                                    Watch file
                                </>)
                            }
                        </Button>
                    </div>
                )}
                <section className={"w-3/4 mx-auto grow p-3 overflow-y-auto"}>
                    <div className="flex flex-col gap-3">

                        {lines.map((line, index) => (
                            <div key={index}
                                 className={"bg-white p-3 rounded-md font-medium shadow-xs border border-cyan-100"}>
                                <div className="flex flex-col  gap-3">
                                    <div className="flex gap-6 items-center">
                                        <div className="flex gap-3 shrink-0">
                                            <div className="h-4 w-4 rounded-full"
                                                 style={{background: levels[line.level]}}></div>
                                            <div className="text-xs">
                                                {line.date ? dayjs(line.date).format('MMMM DD YYYY HH:mm') : '-'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col" style={{color: levels[line.level]}}>
                                            {line.message ? line.message : line.raw}
                                        </div>
                                    </div>

                                    {/*<div className="text-xs opacity-30 text-center hover:opacity-100">{line.raw}</div>*/}

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    )
}

export default IndexView
