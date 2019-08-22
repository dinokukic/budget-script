/*****************

Description: Google Ads script for managing the client's budget
Author: Dino Kukic


**********/

function main() {

//To get the campaigns we first get the shared budgets by their IDs, make sure you exchange IDs with your own

var budgetSelector = AdWordsApp.budgets()
	.withCondition("IsBudgetExplicitlyShared = true")
	.withIds([919911729, 971813687, 1371349908, 1371415178, 1384776128, 919910286, 1358991353, 1375633913])
	.forDateRange("THIS_MONTH");
  //For testing purposes you can uncomment the row below and check the output under 'Logs'
  //Logger.log(budgetSelector);

//Set up a variable with your email and client's monthly budgets in order as the above IDs 
var emailAddress = "your@email.com";
var monthlyBudget = [700, 300, 500, 700, 500, 500, 700, 200];
var budgetNames = [];
var totalSpend = [];
var currentBudget = [];

//Get budget names and the spend for this month
var budgetIterator = budgetSelector.get();
var budgetIDs = [];
//Logger.log(budgetIterator.totalNumEntities());
  
while (budgetIterator.hasNext()) {
	var budget = budgetIterator.next();
	var budgetName = budget.getName();
  	budgetNames.push(budgetName);
  	currentBudget.push(budget.getAmount());
  	totalSpend.push(budget.getStatsFor("THIS_MONTH").getCost());
  	budgetIDs.push(budget.getId());
	
  	//For testing purposes you can uncomment below and check the output under 'Logs'
	//Logger.log(currentBudget);
	//Logger.log(totalSpend);
}
//Again, if you'd like to test uncomment line(s) below
//Logger.log(budgetNames.length);
//Logger.log(budgetNames);
//Logger.log(budgetIDs);

//Get the days in this month
function daysInThisMonth() {
  	var now = new Date();
  	return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
	}

//Get current date
var now = new Date();
var daysSinceStartOfMonth = now.getDate();
//Logger.log(daysSinceStartOfMonth);

//Get the remaining days during this month i.e how many days we want ads to still run
var daysRemaining = daysInThisMonth() - daysSinceStartOfMonth;
//Logger.log(daysRemaining);

//Calculate the adjustment for each of the budgets
var budgetAdjustment = [];
for (var i = 0; i < currentBudget.length; i++) {
	if (monthlyBudget[i] > totalSpend[i]) {
		budgetAdjustment.push((monthlyBudget[i] - totalSpend[i]) / daysRemaining);
    } else {
    budgetAdjustment.push(0);
    }
}
//For testing below...
//Logger.log(budgetAdjustment);

//Set the status of each budgets, either to adjust it or if it's okay at the moment
var budgetStatus = [];
for (var i = 0; i < currentBudget.length; i++) {
	if (budgetAdjustment[i] < currentBudget[i] - 1 || budgetAdjustment[i] > currentBudget[i] + 1) {
		while (budgetIterator.hasNext()) {
			var budgetToSet = budgetIterator.next();
			if (budgetIDs === budgetToSet.getId()) {
				budgetToSet.setAmount(budgetAdjustment);
			}
		}
		budgetStatus.push('Budget Adjusted to: ' + budgetAdjustment[i].toFixed(2));
	}
	else budgetStatus.push('Budget is OK at: ' + currentBudget[i]);
}

//Body of the email that will be sent to you after it's done
var adjustments = "";
var totalThisMonth = 0;
function mailBody() {
	for (var i = 0; i < budgetAdjustment.length; i++) {
    	adjustments = adjustments + "<strong>" + budgetNames[i] + "</strong>: " + "Spent this month: <strong>" + totalSpend[i] + "</strong>; To reach your monthly budget of " + monthlyBudget[i] + ", adjust it to <strong>" + budgetAdjustment[i] + ' ' + budgetStatus[i] + "</strong><br><br>";
    	totalThisMonth = totalThisMonth + totalSpend[i];
    } 
}
mailBody()
//Logger.log(adjustments);
 
//Sending you the email
MailApp.sendEmail({
    to: emailAddress,
    subject: 'My Client Google Ads Adjustments',
    htmlBody: "Hey, <br><br> Here's the daily summary of campaigns for <em>My Client</em>:<br><br>" + adjustments + "Additionally, the total spend so far this month is <strong>" + totalThisMonth + "</strong><br><br>Cheers,",
  });

}