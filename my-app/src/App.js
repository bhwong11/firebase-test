import './App.css';
import {useEffect,useState} from 'react'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc,updateDoc } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKE,
  messagingSenderId: process.env.REACT_APP_MESS_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const getTasks = async (db)=> {
  const taskCol = collection(db, 'test-tasks');
  const taskSnapshot = await getDocs(taskCol);
  return taskSnapshot.docs.map(doc => ({
    ...doc.data(),
    id:doc.id
  }));
}

const getTask = async (id,db)=>{
  const taskRef = doc(db,'test-tasks', id)
  const taskDoc = await getDoc(taskRef);
  if (!taskDoc.exists) {
    console.log('No such document!');
  } else {
    console.log('Document data:', taskDoc.data());
  }
  return {
    ...taskDoc.data(),
    id:taskDoc.id
  }
}

function App() {
  const [tasks,setTasks] = useState([])
  const [taskNameValues,setTaskNameValues] = useState({})

  const updateTask = async (id,updateObj={},db)=>{
    const taskRef = doc(db,'test-tasks', id)
    await updateDoc(taskRef,updateObj);
    getTask(id,db).then(r=>{
      const task = {
        ...r,
        id:r.id
      }
      console.log('task',tasks)
      const taskIndex = tasks.findIndex(task=>task.id===id)
      const tasksCopy = [...tasks]
      tasksCopy[taskIndex] = task
      console.log('taskcoup',tasksCopy)
      setTasks(tasksCopy)
    })
  }

  useEffect(()=>{
    getTasks(db).then(r=>{
      setTasks(r)
    })
    getTask('task1',db).then(r=>{
      console.log('re',r)
    })
  },[])
  return (
    <div className="App">
      <h1>HELLO</h1>
      {tasks.map(task=>(
        <>
        <div>{task.name}</div>
        <div>{task.id}</div>
        <input
          value={taskNameValues[task.id]}
          onChange={(e)=>{
            setTaskNameValues({
              ...taskNameValues,
              [task.id]:e.target.value
            })
          }}
        />
        <button onClick={(e)=>{
          //probs move this to a external func
          e.preventDefault()
          updateTask(task.id,{name:taskNameValues[task.id]},db)
        }}>
          update name
        </button>
        </>
      ))}
    </div>
  );
}

export default App;
