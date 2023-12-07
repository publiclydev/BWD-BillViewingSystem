
const firebaseConfig = {
    apiKey: "AIzaSyCryqPjLmaGxKMLmZpz5s7H7tUCsPFTn3k",
    authDomain: "water-bill-viewing-system.firebaseapp.com",
    projectId: "water-bill-viewing-system",
    storageBucket: "water-bill-viewing-system.appspot.com",
    messagingSenderId: "873708577400",
    appId: "1:873708577400:web:a928f93b377fc092e9838d",
    measurementId: "G-RZ4RJ3WJW8"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get references to the Firestore database
  const db = firebase.firestore();

  var accountname = document.getElementById('name');
  var   address = document.getElementById('address');
  var   account = document.getElementById('account');
  var   bill = document.getElementById('amount');
  var   due = document.getElementById('duedate');
  var   textdate = document.getElementById('textdate');
  var   textdate2 = document.getElementById('textdate2');
  var   account2 = document.getElementById('account2');
  var options = { month: 'long', year: 'numeric' };
  var options2 = { month: 'short', year: 'numeric' };
  
  function fetchData() {
    const accountNumber = document.getElementById('accountNumberInput').value;
    //fetchAllClients();
    console.log(accountNumber);
  
    // Fetch client information
    db.collection("clients").where("account", "==", parseInt(accountNumber)).get().then((clientsSnapshot) => {
      if (!clientsSnapshot.empty) {
        // Client found, fetch bill details
        const clientId = clientsSnapshot.docs[0].id;
        client = clientsSnapshot.docs[0].data();
        accountname.textContent = (client.lastname+", "+client.name).toUpperCase();
        address.textContent = client.address.toUpperCase()
        console.log(accountname);

        db.collection("billing_detail").where("client_account", "==", parseInt(accountNumber)).orderBy("date", "asc").get().then((billsSnapshot) => {
          if (!billsSnapshot.empty) {
            // Display consumption graph and payment history
            const consumptionData = billsSnapshot.docs.map(doc => ({
              date: doc.data().date.toDate().toLocaleDateString('en-US', options2),
              usage: doc.data().usage}));
            const paymentHistory = billsSnapshot.docs.map(doc => ({
              bill: doc.data().bill,
              date: doc.data().date.toDate().toLocaleDateString(), // Convert Firestore Timestamp to JavaScript Date
              date_posted: doc.data().due.toDate().toLocaleDateString()
            }));

            console.log(consumptionData[0].date);
  
            displayConsumptionGraph(consumptionData);
            displayPaymentHistory(paymentHistory);
          } else {
            // No bill details found
            alert('No bill details found for the account number');
          }
        }).catch((error) => {
          console.error("Error fetching bill details:", error);
        });
  
      } else {
        // Client not found
        alert('Client not found for the account number');
      }

      db.collection("billing_detail")
    .where("client_account", "==", parseInt(accountNumber))
    .orderBy("date", "desc") // Order by date in descending order
    .limit(1) // Limit the result set to one document
    .get()
    .then((billsSnapshot) => {
        if (!billsSnapshot.empty) {
        // The first (and only) document in the result set is the latest bill
        const latestBill = billsSnapshot.docs[0].data();
        account.textContent = latestBill.client_account;
        account2.textContent = latestBill.client_account;
        bill.textContent = latestBill.bill;
        due.textContent = latestBill.due.toDate().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
        textdate.textContent = latestBill.date.toDate().toLocaleDateString('en-US', options);
        textdate2.textContent =  latestBill.date.toDate().toLocaleDateString('en-US', options);
        // Display or use the latest bill data as needed
        console.log("Latest Bill:", latestBill);

        // Rest of your code...
        } else {
        // No bill details found
        alert('No bill details found for the account number');
        }
    })
    .catch((error) => {
        console.error("Error fetching bill details:", error);
    });

    }).catch((error) => {
      console.error("Error fetching client information:", error);
    });
    
    const chartDiv = document.querySelector('.content .chart');
    const foundDiv = document.querySelector('.content .found');
    const payDiv = document.querySelector('.content .payhistory');
    const blankDiv = document.querySelector('.content .blank1');
    const blank1Div = document.querySelector('.content .blank');
    chartDiv.classList.remove('hidden');
    foundDiv.classList.remove('hidden');
    payDiv.classList.remove('hidden');
    blankDiv.classList.remove('hidden');
    blank1Div.classList.remove('hidden');
    
  }

  function fetchAllClients() {
    // Get all documents from the "clients" collection
    db.collection("clients").get().then((clientsSnapshot) => {
      if (!clientsSnapshot.empty) {
        // Display or process the data as needed
        const allClientsData = clientsSnapshot.docs.map(doc => doc.data());
        console.log("All Clients Data:", allClientsData);
      } else {
        // No clients found
        console.log("No clients found.");
      }
    }).catch((error) => {
      console.error("Error fetching clients:", error);
    });
  }

  var barColors = ["#383D6D"];

  
  function displayConsumptionGraph(consumptionData) {
    // Assuming you're using Chart.js for simplicity
    const ctx = document.getElementById('consumptionChart').getContext('2d');
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: consumptionData.map(entry => entry.date),
        datasets: [{
          label: 'Consumption',
          data: consumptionData.map(entry => entry.usage),
          backgroundColor: barColors,
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function displayPaymentHistory(paymentHistory) {
    const historyContainer = document.getElementById('historyContainer');
  
    // Clear previous content
    historyContainer.innerHTML = '';
  
    // Create a table
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>BILL MONTH</th>
          <th>POSTING DATE</th>
          <th>BILL AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${paymentHistory.map(entry => `
          <tr>
            <td>${entry.date}</td>
            <td>${entry.date_posted}</td>
            <td>${parseFloat(entry.bill)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    historyContainer.appendChild(table);
  }
