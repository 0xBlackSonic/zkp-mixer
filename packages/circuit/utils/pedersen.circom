pragma circom 2.0.0;

include "./montgomery.circom";
include "./mux3.circom";
include "./basisGenerator.circom";

template Pedersen(n) {
    /*
        For testing purpose we only use 4 base coords from 
        Iden3's Pedersen circom template implementation
    */
    var BASE[4][2] = [
        [10457101036533406547632367118273992217979173478358440826365724437999023779287,19824078218392094440610104313265183977899662750282163392862422243483260492317],
        [2671756056509184035029146175565761955751135805354291559563293617232983272177,2663205510731142763556352975002641716101654201788071096152948830924149045094],
        [5802099305472655231388284418920769829666717045250560929368476121199858275951,5980429700218124965372158798884772646841287887664001482443826541541529227896],
        [7107336197374528537877327281242680114152313102022415488494307685842428166594,2857869773864086953506483169737724679646433914307247183624878062391496185654]
    ];

    signal input in[n];
    signal output o;

    var nWindows = n / 4;
    var nWindowsPerSegment = 50;

    signal pts[nWindows][2];

    var b0;
    var b1;
    var b2;
    var b3;
    
    var p1Idx;
    var p2Idx;
    var p3Idx;

    component pointSelector[nWindows];

    var BASIS[3][50][8][2];
    component BASIS_G[3];

    for(var i = 0; i < 3; i++) {
        BASIS_G[i] = BasisGenerator();

        BASIS_G[i].x <== BASE[i][0];
        BASIS_G[i].y <== BASE[i][1];

        for(var k = 0; k < 50; k++) {
            for(var j = 0; j < 8; j++) {
                BASIS[i][k][j][0] = BASIS_G[i].oPoints[j][k][0];
                BASIS[i][k][j][1] = BASIS_G[i].oPoints[j][k][1];    
            }
        }
    }

    for(var i = 0; i < nWindows; i++) {
        b0 = in[i * 4];
        b1 = in[i * 4 + 1];
        b2 = in[i * 4 + 2];
        b3 = in[i * 4 + 3];

        p1Idx = i \ nWindowsPerSegment;
        p2Idx = i - (i \ nWindowsPerSegment) * nWindowsPerSegment;
        
        /*
            p3Idx = 1 + b0 + 2 * b1 + 4 * b2;

            All the circuits are pre-built and nobody can change its structure.
            
            In this part we are instructing the program to switch the direction 
            depending on a dynamic input (condition) and this is not allowed in 
            circom. In circom you can't write if statements against dynamic inputs. 
            We can mitigate this problem by using a selector template.
        */
        pointSelector[i] = MultiMux3(2);

        // Feed the selectors
        pointSelector[i].s[0] <== b0;
        pointSelector[i].s[1] <== b1;
        pointSelector[i].s[2] <== b2;

        // Feed the candidate values
        for(var k = 0; k < 8; k++) {
            pointSelector[i].c[0][k] <== BASIS[p1Idx][p2Idx][k][0];
            pointSelector[i].c[1][k] <== BASIS[p1Idx][p2Idx][k][1];    
        }

        // Hook the outputs to the points array
        pts[i][0] <== pointSelector[i].out[0];
        pts[i][1] <== pointSelector[i].out[1] * 2 * b3 - pointSelector[i].out[1];
    }

    component adders[nWindows - 1];

    for(var k = 0; k < nWindows - 1; k++) {
        adders[k] = MontgomeryAdd();
        adders[k].in1[0] <== k == 0 ? pts[0][0] : adders[k - 1].out[0];
        adders[k].in1[1] <== k == 0 ? pts[0][1] : adders[k - 1].out[1];
        adders[k].in2[0] <== k == 0 ? pts[1][0] : pts[k + 1][0];
        adders[k].in2[1] <== k == 0 ? pts[1][1] : pts[k + 1][1];
    }

    o <== adders[nWindows - 2].out[0];
}