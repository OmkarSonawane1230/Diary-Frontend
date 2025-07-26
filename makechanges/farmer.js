// Farmer-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
    initializeFarmerDashboard();
});

function initializeFarmerDashboard() {
    const dashboard = document.getElementsByClassName('nav-item')[0];
    const cowManagement = document.getElementById('cowManagement');
    const healthRecords = document.getElementById('healthRecords');
    const feedRecords = document.getElementById('feedRecords');
    const recommendationBtn = document.getElementById("getRecommendationBtn");

    if (recommendationBtn) {
        recommendationBtn.addEventListener("click", handleAiRecommendation);
    }
    if (dashboard) {
        dashboard.addEventListener('click', handleDashboard);
    }
    if (cowManagement) {
        cowManagement.addEventListener('submit', handlerCowDetails);
    }
    if (healthRecords) {
        healthRecords.addEventListener('submit', handleHealthDetails);
    }
    if (feedRecords) {
        feedRecords.addEventListener('submit', handleFeedDetails);
    }
}

async function postData(url = "", data = {}, method_ = "") {
    const options = {
        method: method_,
        headers: {
            "Content-Type": "application/json",
        }
    };

    if (method_.toUpperCase() !== "GET") {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        if (response.status === 204) {
            alert("No Milk Entries found for this farmer");
        }
        if (!response.ok) {
            if (response.status === 404) {
                alert("User not found");
            } else if (response.status === 401) {
                alert("Invalid credentials");
            } else if (response.status === 400) {
                alert("Base values are not set");
            } else {
                alert("not handled at backend");
            }
            return;
        }
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }

    } catch (error) {
        alert("Network error");
    }
}

async function handleDashboard(e) {
    e.preventDefault();
    const entries = document.getElementById('farmerEntries');
    entries.innerHTML = '';

    farmerEntries = await postData(`/api/owner/milk-entries/${localStorage.getItem('farmerId')}`, {}, 'GET');

    farmerEntries.forEach(result => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${result.farmerId}</td>
            <td>${result.quantityInLtr}</td>
            <td>${parseFloat((result.pricePerLtr * result.quantityInLtr).toFixed(2))}</td>`;
        entries.insertAdjacentElement('afterbegin', tr);
    });
}

async function handlerCowDetails(e) {
    e.preventDefault();
    const formData = document.getElementById('cowManagement');
    x = document.getElementById("birthDate").value.split('-');

    date = x[0] + '-' + x[1] + '-' + x[2];
    const data = {
        "farmerId": formData.farmerId.value,
        "cowId": formData.cowId.value,
        "birthDate": date,
        "status": formData.status.value,
        "breed": formData.breed.value
    }
    result = await postData(`/api/farmer/cow-record`, data, 'POST');
    if (result)
        alert(`cow added with id ${result.cowId} successfully`);

}

async function handleFeedDetails(e) {
    e.preventDefault();
    const formData = document.getElementById('feedRecords');
    const data = {
        "cowId": formData.cowId.value,
        "feedType": formData.feedType.value,
        "feedCost": formData.feedCost.value,
        "waterLiters": formData.waterInLiter.value,
        "feedQuantityKg": formData.feedQuantityInKg.value
    }
    result = await postData(`/api/farmer/feed-record`, data, 'POST');
    if (result)
        alert(`feed details added with cow id ${result.cowId} successfully`);
}

async function handleHealthDetails(e) {
    e.preventDefault();
    const formData = document.getElementById('healthRecords');
    const data = {
        "cowId": formData.cowId.value,
        "healthScore": formData.healthScore.value,
        "temperatureC": formData.temperatureInC.value,
        "vetName": formData.vetName.value,
        "treatmentGiven": formData.treatmentGiven.value,
        "symptoms": formData.symptoms.value
    }
    console.log(data);

    result = await postData(`/api/farmer/health-record`, data, 'POST');
    if (result)
        alert(`health details added with cow id ${result.cowId} successfully`);
}

async function handleAiRecommendation(e) {
    e.preventDefault();
    const recommendationBtn = document.getElementById("getRecommendationBtn");
    const formData = document.getElementById('aiRecommendationForm');
    const cardContent = document.querySelector('.ai-recommendation .ai-card .ai-content');
    const existingResults = document.querySelector('.ai-results');

    recommendationBtn.disabled = true;
    recommendationBtn.textContent = "Loading...";

    try {
        const result = await postData(`/api/farmer/predict?farmerId=${formData.farmerId.value}&cowId=${formData.cowId.value}`, {}, 'GET');
        console.log(result);
        if (!result || !result.data) {
            throw new Error("No recommendation data found.");
        }

        const data = result.data;

        // Remove previous results if they exist
        if (existingResults) {
            existingResults.remove();
        }

        // Create results container
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'ai-results';

        // Build stats grid markup
        let resultsHtml = `
            <div class="ai-stats-grid">
                <div class="stat-box"><p class="label">Prediction Date</p><h4>${data.predictionDate || 'N/A'}</h4></div>
                <div class="stat-box"><p class="label">Milk Yield</p><h4>${data.predictedMilkYield || 0} L</h4></div>
                <div class="stat-box"><p class="label">Feed Type</p><h4>${data.feedType || 'N/A'}</h4></div>
                <div class="stat-box"><p class="label">Feed Quantity</p><h4>${data.feedQuantityKg || 0} kg</h4></div>
                <div class="stat-box"><p class="label">Feed Cost</p><h4>₹${data.feedCost || 0}</h4></div>
                <div class="stat-box"><p class="label">Water (L/day)</p><h4>${data.waterRecommendation || 0}</h4></div>
                <div class="stat-box"><p class="label">Profit</p><h4>₹${data.predictedProfit || 0}</h4></div>
                <div class="stat-box"><p class="label">Health Goal</p><h4>${data.healthScoreRecommendation || 'N/A'}</h4></div>
            </div>
        `;

        // Only add routines if they exist
        if (data.optimizationRoutine ) {
            let stepsHtml = '';
            
            try {
                stepsHtml = Object.entries(data.optimizationRoutine)
                    .map(([category, steps]) => {
                        const stepsList = Array.isArray(steps) 
                            ? steps.map(step => `<li>${typeof step === 'string' ? step.replace(/\*\*/g, '') : JSON.stringify(step)}</li>`).join("")
                            : '';
                        return stepsList 
                            ? `<div class="routine-category">
                                <h5>${category}</h5>
                                <ul>${stepsList}</ul>
                              </div>`
                            : '';
                    })
                    .filter(Boolean) // Remove empty strings
                    .join("");
            } catch (routineError) {
                console.error("Error processing routines:", routineError);
                stepsHtml = '<p>Error displaying optimization routines</p>';
            }

            if (stepsHtml) {
                resultsHtml += `
                    <div class="routine-section">
                        <h4>Optimization Routine</h4>
                        ${stepsHtml}
                    </div>
                `;
            }
        }

        // Add assumptions if they exist
        if (data.assumptions) {
            resultsHtml += `
                <div class="assumptions-box">
                    <p><strong>Note:</strong> ${data.assumptions}</p>
                </div>
            `;
        }

        // Add close button
        resultsHtml += `
            <div class="text-center" style="margin-top: 1.5rem;">
                <button onclick="this.closest('.ai-results').remove();" 
                        class="btn btn-secondary">
                    Close Results
                </button>
            </div>
        `;

        // Set the HTML and append to DOM
        resultsDiv.innerHTML = resultsHtml;
        cardContent.appendChild(resultsDiv);

    } catch (error) {
        console.error("Failed to fetch AI recommendation:", error);
        
        // Create error message container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="color: #dc3545; background: #f8d7da; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                <p><strong>Error:</strong> ${error.message || 'Failed to load recommendations'}</p>
            </div>
        `;
        
        cardContent.appendChild(errorDiv);
    } finally {
        recommendationBtn.disabled = false;
        recommendationBtn.textContent = "Get AI Recommendation";
    }
}






