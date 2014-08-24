TestLevel = {
	map: [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
			[1,0,3,0,1,0,0,0,0,0,0,0,1,0,0,1],
			[1,1,7,1,1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,1,1,1,0,0,0,0,10,1],
			[1,0,0,0,0,4,0,0,1,1,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,2,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,1,0,1,0,0,0,0,0,1,1,0,0,1],
			[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

		],
	keyColors: {
		1: 0xff0000,
		2: 0x00ff00,
		3: 0x0000ff
	},
	worlds: {
		1: {
			ambientColor: 0x003366,
			keyMapping: {
				3: 3,
				4: 2
			},
			doorMapping: {
				6: 2,
				7: 1,
				8: 3
			}
		},
		2: {
			ambientColor: 0x001144,
			keyMapping: {
				3: 1,
			},
			doorMapping: {
				6: 1,
				7: 2,
				8: 3
			}	
		}
	}
}