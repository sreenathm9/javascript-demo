let fs = require('fs');
const util = require('util');
const readline = require('readline');
//(task task help) should list of command and usage with examples and commands

//(task report) should list pending task count  and completed task count and also the tasks - completed

//(task add 10 "clean house") should add a task to the database with priority 10 - completed

//(task ls) should list pending task with index and priority - completed

//(task done taskIndex) should mark a task as completed - completed

//(task del taskIndex) should delete a task from pending - completed


async function main() {
    let args = process.argv.slice(2);
    let operation = args[0];
    let arg2 = args[1];
    let arg3 = args[2];
    if (args.length == 0) {
        printHelp();
    } else {
        switch (operation) {
            case 'add':
                addCommand(arg2, arg3);
                break;
            case 'ls':
                listPendingTask();
                break;
            case 'report':
                reportTask();
                break;
            case 'done':
                updateTaskStatus(arg2)
                break;
            case 'del':
                deleteTask(arg2)
                break;
        }
    }

}



function addCommand(priority, title) {
    if (title.trim().length == 0 || priority.trim().length == 0) {
        printHelp();
    } else {
        addTask(title, priority);
    }
}


async function addTask(title, priority) {
    let tasks = await getTasks("pending");
    tasks.push({
        title: title,
        priority: priority
    })
    tasks.sort(GetSortOrder("priority"));
   await writeTofile(tasks , "");

}


async function deleteTask(index) {
    index = Number.parseInt(index);
    let pendingTasks = await getTasks("pending");
    if (index > pendingTasks.length) {
        console.log("\nTask does not exist\n");
    } else {
        let task = pendingTasks.splice(index-1,1)
        await writeTofile(pendingTasks , "");
    }
}

async function updateTaskStatus(index) {
    index = Number.parseInt(index);
    let pendingTasks = await getTasks("pending");
    if (index > pendingTasks.length) {
        console.log("\nTask does not exist\n");
    } else {
        let task = pendingTasks.splice(index-1,1)
        await writeTofile(task , "update");
        await writeTofile(pendingTasks , "");
    }

}

async function reportTask() {
    let completedTasks = await getTasks("completed");
    let pendingTasks = await getTasks("pending");
    console.log(`\nPending: ${pendingTasks.length}`);
    printTasks(pendingTasks);
    console.log(`\n\nCompleted: ${completedTasks.length}`);
    printTasks(completedTasks);
    console.log("\n")

}

async function listPendingTask() {
    let pendingTasks = await getTasks("pending");
    console.log('\n');
    if (pendingTasks.length == 0) {
        console.log(`No Task Added\n\n`);
        // printHelp();
    } else {
        printTasks(pendingTasks)
    }
    console.log('\n');
}

async function printTasks(tasks) {
    let i = 0;
    tasks.sort(GetSortOrder("priority")).forEach(p => {
        i++;
        console.log(`\t${i}. ${p.title} [${p.priority}]`);
    });
}

function getTasks(type) {
    let fileName;
    if (type == "completed") {
        fileName = "completed.txt"
    } else {
        fileName = "task.txt"
    }
    return new Promise(async resolve => {
        let tasks = [];
        const fileStream = fs.createReadStream(fileName);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            let task = line.split(" ");
            if(task.length >=2){
                tasks.push({
                    title: task[1],
                    priority: task[0]
                })
    
            }
        }
        resolve(tasks);
    });
}

function printHelp() {
    let usage = `Usage :-
                $ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
                $ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
                $ ./task del INDEX            # Delete the incomplete item with the given index
                $ ./task done INDEX           # Mark the incomplete item with the given index as complete
                $ ./task help                 # Show usage
                $ ./task report               # Statistics`;
    console.log(usage);
}

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

async function writeTofile(tasks , mode) {
    let fileName = "task.txt"
    if(mode == "update"){
        fileName = "completed.txt"
    }
    let file = fs.createWriteStream(fileName ,{});
    file.on('error', function (err) { /* error handling */ });
    await fs.promises.truncate("task.txt", 0);
    tasks.forEach(function (v) { file.write(`${v.priority} ${v.title}  \n`); });
    file.end();
}





main();