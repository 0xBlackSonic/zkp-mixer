import { Fragment, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import {
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/20/solid";
import { toast } from "react-toastify";

export default function Modal({
  proof = "",
  show = false,
  setShow = () => {},
}) {
  const [backedUp, setBackedUp] = useState<boolean>(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proof);
    toast("Proof copied!");
  };

  const downloadTxtFile = () => {
    const file = new Blob([proof], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "proof.txt";
    link.click();
    toast("Proof file saved!");
  };

  const closeModal = () => {
    setShow();
    setBackedUp(!backedUp);
  };

  return (
    <>
      <Transition.Root show={show} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 font-mono font-thin"
          onClose={() => {}}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out diration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-md text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl bg-gray-900 border border-teal-400">
                  <div className="flex py-2 justify-center bg-teal-400">
                    <span className="text-gray-900 text-lg">Secret Proof</span>
                  </div>
                  <div className="px-4 pb-4 pt-3 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mx-3 sm:mt-0 sm:text-left">
                        <div className="my-2 text-sm text-gray-300">
                          <span>
                            <p>
                              Please save your proof in a secure place. You will
                              need it later to withdraw your deposit back.
                            </p>
                            <p className="mt-3">
                              <span className="font-bold underline">
                                IMPORTANT
                              </span>
                              : Never share your proof with anyone.
                            </p>
                          </span>
                        </div>
                        <div className=" flex mt-2 justify-end">
                          <button
                            type="button"
                            className="relative inline-flex items-center text-sm shadow-sm focus:outline-none text-teal-500 hover:text-teal-300 mx-2 my-1"
                            onClick={copyToClipboard}
                          >
                            <ClipboardDocumentListIcon className="h-7 w-7" />
                          </button>
                          <button
                            type="button"
                            className="relative inline-flex items-center text-sm shadow-sm focus:outline-none text-teal-500 hover:text-teal-300 mx-2 my-1 mr-5"
                            onClick={downloadTxtFile}
                          >
                            <DocumentArrowDownIcon className="h-7 w-7" />
                          </button>
                        </div>
                        <div className="break-all rounded-md bg-gray-500 bg-opacity-20">
                          <div
                            className="p-3 h-60 overflow-auto"
                            style={{
                              scrollbarColor:
                                "rgb(45,212,191) rgb(45,212,191,0.05)",
                              scrollbarWidth: "auto",
                            }}
                          >
                            <span className="text-xs text-gray-300">
                              {proof}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-gray-300 px-4">
                      <Switch
                        checked={backedUp}
                        onChange={setBackedUp}
                        className={`${
                          backedUp ? "bg-opacity-40" : "bg-opacity-5"
                        } relative inline-flex h-6 w-11 items-center rounded-full bg-teal-400 border-2 border-teal-400`}
                      >
                        <span className="sr-only">BackedUp</span>
                        <span
                          className={`${
                            backedUp ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full transition  bg-teal-400`}
                        />
                      </Switch>
                      <span className="text-sm ml-3">I saved the proof</span>
                    </div>
                  </div>

                  <div className="flex mt-1 pb-5 sm:px-6 justify-center">
                    <button
                      type="button"
                      className="relative inline-flex items-center rounded-md py-2 text-sm shadow-sm focus:outline-none border-2 border-teal-400 text-teal-400 px-7 font-thin hover:bg-teal-400 hover:bg-opacity-20 hover:text-teal-400 bg-teal-400 bg-opacity-10"
                      onClick={closeModal}
                      disabled={!backedUp}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
