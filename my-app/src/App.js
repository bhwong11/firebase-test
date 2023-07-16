import './App.css';
import {useEffect,useState} from 'react'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc,updateDoc, addDoc } from 'firebase/firestore/lite';
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
  const [newTask,setNewTask] = useState({})

  const createTask = async (taskObj={},db)=> {
    try {
      const taskCol = collection(db, 'test-tasks');
      const taskSnapshot = await addDoc(taskCol,{
        ...taskObj,
        user:doc(db,'test-users', 'user1')
      });
      console.log("Document written with ID: ", taskSnapshot.id,taskSnapshot);
      getTask(taskSnapshot.id,db).then(r=>{
        const task = {
          ...r,
          id: taskSnapshot.id
        }
        const tasksCopy = [...tasks,task]
        setTasks(tasksCopy)
      })
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const updateAndSetTask = async (id,updateObj={},db)=>{
    const taskRef = doc(db,'test-tasks', id)
    await updateDoc(taskRef,updateObj);
    getTask(id,db).then(r=>{
      const task = {
        ...r,
        id:r.id
      }
      const taskIndex = tasks.findIndex(task=>task.id===id)
      const tasksCopy = [...tasks]
      tasksCopy[taskIndex] = task
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
          updateAndSetTask(task.id,{name:taskNameValues[task.id]},db)
        }}>
          update name
        </button>
        </>
      ))}

      <div>
        {JSON.stringify(newTask)}
        <div>
        name
        <input
          value={newTask['name']}
          onChange={(e)=>{
            setNewTask({
              ...newTask,
              name:e.target.value
            })
          }}
        />
        </div>
        <div>
        description
        <input
          value={newTask['description']}
          onChange={(e)=>{
            setNewTask({
              ...newTask,
              description:e.target.value
            })
          }}
        />
        </div>
        <button onClick={async (e)=>{
          //probs move this to a external func
          e.preventDefault()
          await createTask(newTask,db)
          setNewTask({
            name:'',
            description:''
          })
        }}>
          update name
        </button>
      </div>
    </div>
  );
}

export default App;
