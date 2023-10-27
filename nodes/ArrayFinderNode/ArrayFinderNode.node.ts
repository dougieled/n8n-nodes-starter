import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	//NodeOperationError,
} from 'n8n-workflow';

export class ArrayFinderNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Array Finder',
		name: 'arrayFinder',
		group: ['transform'],
		version: 1,
		description: 'Array Finder  - Pass in an Array and include dynamic property name along with the value the property should match to return an object',
		defaults: {
			name: 'Array Finder',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Event Table',
				name: 'event_table',
				type: 'options',
				options: [
					{
						name: 'Application Events',
						value: 'application_events',
					},
					{
						name: 'Trace Events',
						value: 'trace_events',
					},
					{
						name: 'Trace Completed Events',
						value: 'trace_complete_events',
					},
					{
						name: 'After Email Events',
						value: 'after_email_events',
					},
				],
				default: 'application_events',
			},

			{
				displayName: 'Filters',
				name: 'filters',
				placeholder: 'Add Filter',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Enter Property name and Value you would like to filter by',
				options: [
					{
						name: 'filterValues',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Property',
								name: 'property',
								type: 'options',
								default: 'status',
								options: [
									{
										name: 'Status',
										value: 'status',
									},
									{
										name: 'Closed Reason',
										value: 'closedReason',
									},
									{
										name: 'Email',
										value: 'email',
									},
								],
								description: 'Property key to add',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value to add',
							},
						],
					},
				]
			}

		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let items: INodeExecutionData[] = [];
		let newItemJson: IDataObject = {};
		let arrayToFilter: any[];
		let eventTable: string;
		let filters: { filterValues: { property: string, value: string }[] }
		let itemFromFilter: any;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		//for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {

			filters = this.getNodeParameter('filters', 0, '') as { filterValues: { property: string, value: string }[] };

			eventTable = this.getNodeParameter('event_table', 0, []) as string;
			switch (eventTable) {
				case 'application_events':
					arrayToFilter = [
						{ emailToSend: 'applicationReceivedSuccessfully', status: 'in-progress' },
						{ emailToSend: 'serviceCompleteUnsuccessful', status: 'closed' },
						{ emailToSend: 'serviceCompleteSuccessful', status: 'complete' }
					];
					break;
				case 'trace_events':
					arrayToFilter = [
						{ emailToSend: 'loaWetSignatureNeeded', status: 'Request Wet Signature (Required by OP)' },
						{ emailToSend: 'signatureWordingUpdate', status: 'Request Wet Signature (Missing from app)' },
						{ emailToSend: 'missingInformation', status: 'Customer - Missing Info' },
						{ emailToSend: 'moreInfoFromEmployer', status: 'Employer - More Info Needed' },
						{ emailToSend: 'providerLORSentDirectToCustomer', status: 'LOR Sent To Customer' }
					];
					break;
				case 'trace_complete_events':
					arrayToFilter = [
						{ emailToSend: 'clairesRules', status: 'complete', closedReason: "Claire's rule" },
						{ emailToSend: 'searchUnsuccessful', status: 'complete', closedReason: "Pension Not Found" },
						{ emailToSend: 'pensionReportEmail', status: 'complete', closedReason: "Send Pension Report" },
						{ emailToSend: 'providerUnableToFindPolicy', status: 'complete', closedReason: "Provider has no pension" },
						{ emailToSend: 'providerConfirmedRetirementIncomeOrFullCash', status: 'complete', closedReason: "Benefits Taken" },
						{ emailToSend: 'noResponseTwoMonths', status: 'complete', closedReason: "OP didn't reply" },
						{ emailToSend: 'refundOfContributions', status: 'complete', closedReason: "Refund" },
						{ emailToSend: 'definedBenefits', status: 'complete', closedReason: "Defined Benefit" },
						{ emailToSend: 'eRNoCompanyPensionDuringClientEmployment', status: 'complete', closedReason: "Employer has no pension" },
						{ emailToSend: 'providerConfirmedTransferOut', status: 'complete', closedReason: "Transferred Out" },
						{ emailToSend: 'template19_crystallisedPension', status: 'complete', closedReason: "Crystallised" },
						{ emailToSend: 'definedBenefits', status: 'complete', closedReason: "Unknown Defined Benefits" },
						{ emailToSend: 'providerLORSentDirectToCustomer', status: 'complete', closedReason: "Customer didn't forward LOR" },
						{ emailToSend: 'loaRejectedContactProvider', status: 'complete', closedReason: "LOA Rejected" }
					];
					break;
				case 'after_email_events':
					arrayToFilter = [
						{ emailToSend: 'loaSent', email: 'loaCoveringEmailDataRequestToProvider', status: 'Generate & Send LOA' },
						{ emailToSend: 'loaSent', email: 'loaCoveringEmailDataRequestToProviderUnknown', status: 'Generate & Send LOA' },
						{ emailToSend: 'noResponseFromProvider', email: 'loaCoveringEmailDataRequestProviderChaserUnknownPolicyNumber', status: 'Generate & Send LOA' },
						{ emailToSend: 'noResponseFromProvider', email: 'loaCoveringEmailDataRequestProviderUnknownPolicyWetPostFollowUp', status: 'Generate & Send LOA' },
						{ emailToSend: 'noResponseFromProvider', email: 'loaCoveringEmailDataRequestProviderKnownPolicyNumber', status: 'Generate & Send LOA' },
						{ emailToSend: 'loaSent', email: 'loaCoveringEmailDataRequestProviderWetSignature', status: 'in-progress' },
						{ emailToSend: 'noResponseFromProvider', email: 'letter-11', status: 'in-progress' },
						{ emailToSend: 'noResponseFromProvider', email: 'letter-9a', status: 'in-progress' }
					];
					break;
				default:
					arrayToFilter = []
			}

			itemFromFilter = arrayToFilter.find(item => {
				return filters.filterValues.every(filter => item[filter.property] === filter.value);
			});
			newItemJson = itemFromFilter;

		} catch (error) {
			// This node should never fail but we want to showcase how
			// to handle errors.
			if (this.continueOnFail()) {
				newItemJson = { error };
			} else {
				// Adding `itemIndex` allows other workflows to handle this error
				//if (error.context) {
				// If the error thrown already contains the context property,
				// only append the itemIndex
				//error.context.itemIndex = itemIndex;
				throw error;
			}
		}
		//}
		items.push({
			json: newItemJson,
			binary: undefined,
		});
		return this.prepareOutputData(items);
	}
}
