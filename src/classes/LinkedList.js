class _Node {
  constructor(value, next){
    this.value = value;
    this.next = next; 
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(value) {
    // 1. instantiate new node
    // 2. set new node's next to head
    // 3. set head to this new node
    this.head = new _Node(value, this.head);
  }

  insertLast(value) {
    let currentNode = this.head;
    if (currentNode == null) {
      this.insertFirst(value);
      return;
    }

    while (currentNode.next != null) {
      currentNode = currentNode.next;
    }
    currentNode.next = new _Node(value, null);
  }

  insertBefore(value, findValue) {
    let currNode = this.head;
    if (currNode == null) {
      console.error(`The list is empty!`);
      return;
    }
    while (currNode.next != null) {
      if (currNode.next.value === findValue) {
        // found the stuff!11~
        currNode.next = new _Node(value, currNode.next);
        return;
      }
      currNode = currNode.next;
    }
    console.error(`Node with ${findValue} does not exist!`);
  }

  insertAfter(value, findValue) {
    let currNode = this.head;
    if (currNode === null) {
      console.error(`The list is empty!`);
      return;
    }

    while (currNode.next !== null) {
      if (currNode.value === findValue) {
        currNode.next = new _Node(value, currNode.next);
        return;
      }
      currNode = currNode.next;
    }
    console.error(`Node with ${findValue} does not exist!`);
  }

  insertAt(value, numPosition) {
    let currNode = this.head;
    if (numPosition === 0) {
      this.head = new _Node(value, currNode.next);
      return;
    }
    let count = 1;
    while (currNode.next != null) {
      if (count === numPosition) {
        currNode.next = new _Node(value, currNode.next);
        return;
      }
      currNode = currNode.next;
      count++;
    }

    console.error(`Node with position of ${numPosition} does not exist!`);
  }

  insertAtOrLast(value, numPosition) {
    let currNode = this.head;
    if (numPosition === 0) {
      this.head = new _Node(value, currNode.next);
      return;
    }
    let count = 1;
    while (currNode.next != null) {
      if (count === numPosition) {
        currNode.next = new _Node(value, currNode.next);
        return;
      }
      currNode = currNode.next;
      count++;
    }

    currNode.next = new _Node(value, null);
  }

  remove(value) {
    if (this.head == null) { return; }
    if (this.head.next == null) {
      if (this.head.value === value) {
        this.head = null;
        return;
      }
      else {
        return;
      }
    }

    if (this.head.value === value) {
      this.head.next = this.head.next.next;
      return;
    }
    let previousNode;
    let currNode = this.head;
    while (currNode.next != null) {
      if (currNode.next.value === value) {
        currNode.next = currNode.next.next;
        return;
      }
      previousNode = currNode;
      currNode = currNode.next;
    }

    if (currNode.value === value) {
      previousNode.next = null;
      return;
    }
  }

  moveToNext() {
    if (this.head == null) { 
      return;
    }
    this.head = this.head.next;
  }

  find(value) {
    let currentNode = this.head;
    if (currentNode == null) {
      console.error(`The list is empty!`);
    }

    while (currentNode.next != null) {
      if (currentNode.value === value) {
        return currentNode;
      }
      currentNode = currentNode.next;
    }
    console.error(`Node with ${value} does not exist!`);
  }
}

module.exports = LinkedList; 