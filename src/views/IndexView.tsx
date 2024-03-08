import FileHandleIDB from "../db/FileHandleIDB";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button, Dropdown, Spinner} from "flowbite-react";
import Icon from "../components/Icon";
import dayjs from "dayjs";
import noop from "../utils/noop";
import {Levels} from "../interfaces/Levels";
import {Line} from "../interfaces/Line";
import ReadmeModal from "./ReadmeModal";
import {FileHandleDecorator} from "../interfaces/FileHandleStorage";

function IndexView() {

    const formats:Formats = {
        "RAW" : null,
        "MONOLOG" : '^\\[(?<date>[^\\]]+)\\] (?<message>.+)'
    }
    const levels: Levels = {
        DEBUG: '#696969',
        INFO: '#4169E1',
        WARNING: '#FFA500',
        ERROR: '#d63e48',
        CRITICAL: '#4B0082'
    }
    const [loading, setLoading] = useState<boolean>(false)
    const [readmeModalOpen, setReadmeModalOpen] = useState<boolean>(false)
    const [fileHandles, setFileHandles] = useState<FileHandleDecorator[]>([])
    const [fileHandle, setFileHandle] = useState<FileHandleDecorator | null>(null)
    const [lines, setLines] = useState<Line[]>([])
    const [filterLevels, setFilterLevels] = useState<string[]>([...Object.keys(levels)])
    const [filterFormat, setFilterFormat] = useState<string>("RAW")
    const [nbLines, setNbLines] = useState<number>(90)
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



    async function createFileHandle(_fileHandle?: FileSystemFileHandle): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const localFileHandle = _fileHandle || (await window.showOpenFilePicker())[0];
        const fileHandleIDB = await FileHandleIDB;
        const _key = `fileHandle-${Date.now()}`
        const fileHandleDecorator = {key : _key, fileHandle: localFileHandle} as FileHandleDecorator
        fileHandleIDB.update(_key, fileHandleDecorator);
        fileHandles.push(fileHandleDecorator)
        void readFile(fileHandleDecorator)
    }

    async function removeHandle(_fileHandle:FileHandleDecorator){
        const fileHandleIDB = await FileHandleIDB;
        fileHandleIDB.delete(_fileHandle.key);
        setFileHandles(prevState => prevState.filter(fh => fh.key !== _fileHandle.key));
        if(fileHandle && fileHandle.key === _fileHandle.key){
            //clear current file
            setFileHandle(null)
            setLines([])
        }
    }

    async function readFile(_fileHandle: FileHandleDecorator) {
        console.log(_fileHandle)
        const file = await _fileHandle.fileHandle.getFile();
        setFileHandle(_fileHandle)
        const linesFound = []
        setLoading(true)
        const text = await file.text();
        const lines = text.split('\n');
        let formatRegexp = null;
        if(Object.prototype.hasOwnProperty.call(formats, filterFormat)){
            const format = formats[filterFormat];
            if(format){
                formatRegexp = new RegExp(format, '')
            }
        }
        let index = 0;
        const fileLength = lines.length - 1
        while (linesFound.length < nbLines && fileLength > index) {
            const i = fileLength - index
            if (!lines[i]) {
                index++
                continue;
            }
            const parsedLine = formatRegexp ? formatRegexp.exec(lines[i].toString().trim()) : null
            const line: Line = {
                level: 'DEBUG',
                raw: lines[i],
                date: parsedLine ? parsedLine?.groups?.date : undefined,
                message: parsedLine ? parsedLine?.groups?.message : undefined
            }
            for (const level of Object.keys(levels)) {
                if (lines[i].includes(level)) {
                    line.level = level as keyof Levels;
                }
            }
            //No filter or filter is matching
            if (filterLevels.length === 0 || filterLevels.includes(line.level)) {
                linesFound.push(line);
            }
            index++
        }
        setLines(linesFound)
        setLoading(false)
    }

    async function reloadHandle(_fileHandle: FileHandleDecorator) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await _fileHandle?.fileHandle.requestPermission({mode: 'read'})
        const file = await _fileHandle.fileHandle.getFile();
        if (!watchLastModified || file.lastModified > watchLastModified) {
            // setWatchLastModified(file.lastModified)
            watchLastModified = file.lastModified
            void readFile(_fileHandle)
        } else {
            console.log("No reload.")
        }
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

    function toggleFilterLevel(level: string) {
        if (filterLevels.includes(level)) {
            filterLevels.splice(filterLevels.indexOf(level), 1)
        } else {
            filterLevels.push(level)
        }
        setFilterLevels([...filterLevels])

    }

    useEffect(()=>{
        if (fileHandle) {
            void readFile(fileHandle)
        }
    },[filterLevels, filterFormat])



    return (
        <>
            <div className={"fixed bottom-5 opacity-70 hover:opacity-100 text-sm right-5"}>

            </div>
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
                        <Dropdown.Item onClick={() => {
                            void createFileHandle()
                        }}>Open a new log file</Dropdown.Item>
                        <Dropdown.Divider/>

                        {fileHandles.map((fileHandle) => (
                            <Dropdown.Item as={'div'} key={fileHandle.key}>
                                <div className="flex items-stretch h-full w-full gap-1.5">
                                    <div onClick={() => {
                                        void reloadHandle(fileHandle)
                                    }}  className="grow hover:font-medium flex items-center justify-start  ">
                                        {fileHandle.fileHandle.name}
                                    </div>
                                    <Button onClick={()=>{removeHandle(fileHandle)}} size={"xs"} color={"light"}>
                                        <Icon name={"trash"} size={16}/>
                                    </Button>

                                </div>
                            </Dropdown.Item>
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
                    <div className={"border-l px-3 border-cyan-100"}>
                        <Button onClick={() => {
                            setReadmeModalOpen(true)
                        }} color={"light"} size={"xs"}>
                            Read.me
                        </Button>
                    </div>

                </div>
            </header>
            <main className={"py-6 flex flex-col"}>
                {fileHandle && (
                    <div className="w-3/4 mx-auto shrink-0 font-light text-sm gap-3 px-3 py-3 flex justify-between">
                        <div className="flex items-center bg-white px-3 border-gray-200 rounded-md border gap-1.5">
                            <Icon name={"textbook"} size={16}></Icon>
                            Current file :
                            <div className="font-medium ">
                                {fileHandle.fileHandle?.name}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center font-medium  rounded-md  gap-1.5">
                                Nb lines :
                                <Dropdown color={"light"} size={"xs"} label={`${nbLines} lines`} dismissOnClick={false}>
                                    <Dropdown.Item onClick={() => {
                                        setNbLines(30)
                                    }}>30 lines</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        setNbLines(60)
                                    }}>60 lines</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        setNbLines(90)
                                    }}>90 lines</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        setNbLines(120)
                                    }}>120 lines</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        setNbLines(150)
                                    }}>150 lines</Dropdown.Item>
                                </Dropdown>
                            </div>

                            <div className="flex items-center font-medium rounded-md  gap-1.5">
                                Levels :
                                <Dropdown color={"light"} size={"xs"} label={filterLevels ? filterLevels.join(', ') : 'All'}
                                          dismissOnClick={false}>
                                    {Object.entries(levels).map(([key, value]) => (
                                        <Dropdown.Item onClick={() => {
                                            toggleFilterLevel(key)

                                        }}>
                                            <div
                                                className={`flex gap-3 items-center ${filterLevels.includes(key) ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                                                <div className="h-2 w-2 rounded-full"
                                                     style={{background: value}}></div>
                                                {key}
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown>
                            </div>
                            <div className="flex items-center font-medium rounded-md  gap-1.5">
                                Format :
                                <Dropdown color={"light"} size={"xs"} label={filterFormat}
                                          dismissOnClick={false}>
                                    {Object.keys(formats).map((key) => (
                                        <Dropdown.Item onClick={() => {
                                            setFilterFormat(key)
                                        }}>
                                            <div
                                                className={`flex gap-3 items-center ${filterFormat === key ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                                                {key}
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown>
                            </div>
                            <Button  size={"xs"} onClick={watchHandle}>
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
                    </div>
                )}
                <section className={"w-3/4 mx-auto grow p-3 overflow-y-auto"}>
                    <div className="flex flex-col gap-3">

                        {loading ? (<div className={"flex items-center justify-center  p-3 text-xl gap-1.5 w-full"}>
                            <Spinner aria-label="Spinner button example" size="lg"/>
                            <span className="pl-3 tracking-wide font-light">Parsing file...</span>
                        </div>) : lines.map((line, index) => (
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
                                        <div className="flex flex-col break-all" style={{color: levels[line.level]}}>
                                            {line.message ? line.message : line.raw}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <ReadmeModal isOpen={readmeModalOpen} onClose={() => {
                setReadmeModalOpen(false)
            }}></ReadmeModal>
        </>
    )
}

export default IndexView
