import React, { useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeSubmitBody {
  code: string;
  extension: string;
}
type Inputs = {
  code: string;
  extension: string;
};

const languages: {
  [key: string]: string;
} = {
  javascript: 'js',
  typescript: 'ts',
  cpp: 'cpp',
  c: 'c',
  python: 'py',
};

const Home: React.FC = () => {
  const { register, handleSubmit, watch } = useForm<Inputs>();
  const [output, setOutput] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  // const [language, setLanguage] = useState('cpp');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  let pollInterval: number;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const extensionKey = data.extension;
    const extension = languages[extensionKey];
    const payload: CodeSubmitBody = {
      extension,
      code: editorRef.current?.getValue() as string,
    };
    try {
      setOutput('');
      setStatus(null);
      setJobId(null);
      const { data } = await axios.post('http://localhost:5000/api/code/run', payload);
      if (data.jobId) {
        setJobId(data.jobId);
        setStatus('Submitted');

        // poll here
        pollInterval = setInterval(async () => {
          const { data: statusRes } = await axios.get(
            `http://localhost:5000/api/code/status`,
            {
              params: {
                id: data.jobId,
              },
            },
          );
          const { success, job, error } = statusRes;
          console.log(statusRes);
          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            if (jobStatus === 'pending') return;
            setOutput(jobOutput);
            clearInterval(pollInterval);
          } else {
            console.error(error);
            setOutput(error);
            setStatus('Bad request');
            clearInterval(pollInterval);
          }
        }, 1000);
      } else {
        setOutput('Retry again.');
      }
    } catch (err) {
      if (err) {
        // const errMsg = response.data.err.stderr;
        // setOutput(errMsg);
        console.log('object', err);
      } else {
        setOutput('Please retry submitting.');
      }
    }
    // alert(JSON.stringify({ extension, code: editorRef.current?.getValue() }));
  };
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    // eslint-disable-next-line no-unused-vars
    monaco: Monaco,
  ) {
    editorRef.current = editor;
  }

  React.useEffect(() => {
    const subscription = watch((value) => {
      setSelectedLanguage(value.extension);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <div className="bg-gray flex h-screen overflow-hidden">
      <div className="w-3/4 flex-shrink-0">
        <Editor
          height="90vh"
          language={selectedLanguage}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            fontSize: 16,
          }}
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex justify-between px-4 pt-2">
          <select {...register('extension')} className="bg-gray text-gray-lighter">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
          <input
            type="submit"
            className="bg-indigo-600 p-2 text-gray-lightest hover:bg-indigo-500 cursor-pointer"
          />
        </form>
      </div>

      <div className="bg-white w-full flex flex-col">
        <div className="bg-gray-dark h-1/2 flex flex-col">
          <h1 className=" text-gray-semiDark">Input:</h1>
          <textarea className="bg-gray-dark w-full h-full text-white"></textarea>
        </div>
        <div className="bg-gray-darkest h-1/2 flex flex-col">
          <h1 className="text-gray-semiDark">Output:</h1>
          {JSON.stringify({ output, status, jobId })}
        </div>
      </div>
    </div>
  );
};
export default Home;
