import {Modal} from "flowbite-react";


function ReadmeModal({isOpen, onClose}: { isOpen: boolean, onClose: () => void }) {

    return (
        <>
            <Modal size="5xl" show={isOpen} onClose={onClose}>
                <Modal.Header>Read.me</Modal.Header>
                <Modal.Body>
                    <div className={"text-sm"}>
                        <h1 className={"text-xl font-semibold"}>How to use it</h1>
                        <div className="px-1.5 border-l border-l-grey-100">
                            <div className="mt-3">
                                <h2 className={"text-lg"}>Reading local files</h2>
                                <p className={"mt-1.5 opacity-80"}>
                                    To read local files, simply open the file by dropping it into the app or using the
                                    'Open File' button. The log files are parsed and colored by severity (DEBUG, INFO,
                                    WARNING, ERROR, CRITICAL), and the last 30 lines will be displayed to prevent memory
                                    leaks.
                                </p>
                            </div>
                            <div className="mt-3">
                                <h2 className="text-lg">Reading Server Files</h2>
                                <div className={"mt-1.5 opacity-80"}>
                                    <p>An external setup is required to read files from the server:</p>
                                    <ol className={"p-1.5"}>
                                        <li>1. Pull your log file locally from the server using the following command:
                                            <div className="bg-cyan-500 my-1.5 text-white px-1.5 py-1 w-fit rounded-md">
                                                ssh myuser@myserver tail -f /path/to/my/log.log &gt; myserver.log
                                            </div>
                                        </li>
                                        <li>2. Import the file <i>myserver.log</i> into the app.</li>
                                        <li>
                                            3. (optionnal) While the command is running, you can activate the&nbsp;<i>Watch file</i>&nbsp;feature to automatically parse the file every 3 seconds, simulating a live refresh.
                                        </li>
                                    </ol>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={"text-sm mt-6"}>
                        <h1 className={"text-xl font-semibold"}>How it works</h1>
                        <div className="px-1.5 border-l border-l-grey-100 opacity-80">
                            <div className="mt-3">
                                <p>The application uses the <a
                                    className={"text-blue-700 font-semibold hover:text-blue-800"}
                                    href="https://developer.chrome.com/docs/capabilities/web-apis/file-system-access?hl=en#browser_support"
                                    target="_blank">File System Access API</a>, which allows the browser to access local
                                    files with the user's authorization. This API offers a rich interface for securely
                                    reading and writing to the local file system, facilitating file creation, reading
                                    file contents, and interacting with folders on the user's disk.</p>

                                <div className="pt-1.5">
                                    <ul>
                                        <li><strong>Secure Access</strong>: The API requires the user to explicitly
                                            grant access to each file or folder, ensuring a secure interaction between
                                            the website and the local file system.
                                        </li>
                                        <li><strong>Browser Support</strong>: The File System Access API is supported in
                                            recent versions of Chromium-based browsers, such as Chrome, Edge, and Opera.
                                            Support for other browsers may be limited or absent. It is recommended to
                                            check the current support and use feature detection functionalities to
                                            provide alternatives or informative messages to users of unsupported
                                            browsers.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={"text-sm mt-6"}>
                        <h1 className={"text-xl font-semibold"}>Security Considerations</h1>
                        <div className="px-1.5 border-l border-l-grey-100 opacity-80">
                            <div className="mt-3">
                                <p className={"text-blue-700"}>
                                    The files you import into the application are <strong>NOT</strong> stored or saved
                                    on any server.
                                </p>
                                <p>
                                    Instead, the application utilizes IndexedDB within your browser to store a
                                    reference, or "pointer," to each file you open. This mechanism does not save the
                                    actual file data but allows the application to request your permission to access the
                                    file again in the future. <br/> This approach is designed to enhance security and
                                    privacy by ensuring that file data remains on your device, under your control.
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

        </>
    )
}

export default ReadmeModal
