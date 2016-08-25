var xml = {};
var shopJson        = '[' +
	'{"prefecturesCode":"13","lineCode":"11302","stationCode":"1130210","key":"1000000001","levels":"5","tags":"ラーメン","value":"渡なべ","streetAddress":"東京都新宿区高田馬場2-1-4","phoneNumber":"03-3209-5615","businessHours":"11:00～21:00","regularHoliday":"無休","smoking":"","parkingLot":"無","externalLink":"http://www.watanabestyle.com/","remarks":"ＪＲ山手線 高田馬場駅 徒歩４分<br>東京メトロ東西線 高田馬場駅 徒歩３分<br>東京メトロ副都心線 西早稲田駅 徒歩４分","updateDate":"2016/07/20"},' +
	'{"prefecturesCode":"13","lineCode":"11302","stationCode":"1130210","key":"1000000002","levels":"5","tags":"鰻","value":"愛川","streetAddress":"東京都新宿区高田馬場1-17-22","phoneNumber":"03-3200-3717","businessHours":"11:30～13:30（火〜土、日）<br>17:00～19:00（日のみ・L.O 18:00）","regularHoliday":"月曜（ただし祝日の場合は次の日振替休日）","smoking":"","parkingLot":"無","externalLink":"http://tabelog.com/tokyo/A1305/A130503/13029734/","remarks":"JR・西武新宿線 高田馬場駅 歩5分<br>東京メトロ東西線 高田馬場駅7番口 歩2分<br>高田馬場駅から365m","updateDate":"2016/07/20"},' +
	'{"prefecturesCode":"13","lineCode":"26005","stationCode":"2600514","key":"1000000003","levels":"5","tags":"ラーメン","value":"麺処 にそう","streetAddress":"東京都大田区東矢口3-1-11","phoneNumber":"非公開","businessHours":"11:00～15:30","regularHoliday":"日曜","smoking":"","parkingLot":"無","externalLink":"https://twitter.com/rojiura3111","remarks":"東急池上線・蓮沼駅から徒歩10秒<br>蓮沼駅から11m","updateDate":"2016/07/20"},' +
	'{"prefecturesCode":"11","lineCode":"22007","stationCode":"2200729","key":"1000000004","levels":"5","tags":"ラーメン","value":"つけそば丸永 川越店","streetAddress":"埼玉県川越市仲町10-13","phoneNumber":"非公開","businessHours":"11:00〜スープ切れ次第終了","regularHoliday":"水曜","smoking":"","parkingLot":"無","externalLink":"http://tabelog.com/saitama/A1103/A110303/11038582/<br>https://twitter.com/tsukesobamaruei","remarks":"西武新宿線本川越駅より徒歩15分<br>JR・東武東上線川越駅、本川越駅より東武バス仲町バス停降車徒歩3分<br>松本醤油敷地","updateDate":"2016/07/20"},' +
	'{"prefecturesCode":"44","lineCode":"11906","stationCode":"1190635","key":"1000000005","levels":"5","tags":"焼鳥","value":"炭仙人","streetAddress":"大分県速見郡日出町大神4108-2","phoneNumber":"0977-73-2783","businessHours":"11:00～14:00（L.O.13:30）<br>17:00～22:00（L.O.21:30）","regularHoliday":"水曜日・第3木曜日","smoking":"","parkingLot":"有(20台)","externalLink":"http://tabelog.com/oita/A4403/A440301/44006384/","remarks":"","updateDate":"2016/07/29"},' +
	'{"prefecturesCode":"12","lineCode":"99335","stationCode":"9933503","key":"1000000006","levels":"5","tags":"海鮮","value":"久六","streetAddress":"千葉県銚子市新生町1-36-49","phoneNumber":"0479-22-1038","businessHours":"11:30～17:00","regularHoliday":"火曜日","smoking":"","parkingLot":"無(店舗前、市場駐車場に駐車可)","externalLink":"http://tabelog.com/chiba/A1205/A120501/12000082/","remarks":"銚子駅より徒歩18分くらい<br>観音駅から558m","updateDate":""},' +
	'{"prefecturesCode":"43","lineCode":"11924","stationCode":"1192411","key":"1000000007","levels":"5","tags":"焼肉","value":"たなか畜産","streetAddress":"熊本県天草市五和町城河原2-101-1","phoneNumber":"0969-34-0288","businessHours":"「販売」※土・日・祝日<br>９：００～１９：００<br>（毎月第一金、土、日は売り出しです）<br><br>「食事」※月・火（祝日の場合）水・木・金・土・日<br>１１：３０～２２：００<br>ランチ営業、日曜営業","regularHoliday":"火曜（祝日の場合は営業）","smoking":"全面喫煙可","parkingLot":"有(30台)","externalLink":"http://tabelog.com/kumamoto/A4305/A430501/43007266/","remarks":"本渡バスセンターより車で１５分<br>天草空港より車で３分","updateDate":""},' +
	'{"prefecturesCode":"13","lineCode":"99302","stationCode":"9930219","key":"1000000008","levels":"5","tags":"鰻","value":"鰻禅","streetAddress":"東京都墨田区吾妻橋3-6-18","phoneNumber":"03-3624-0475","businessHours":"11:00～20:00（売り切れて店仕舞いになることがあります）","regularHoliday":"月曜日（月曜日が祝祭日の場合、翌日が定休日）","smoking":"全席可能","parkingLot":"無","externalLink":"http://tabelog.com/tokyo/A1312/A131203/13058979/<br>","remarks":"・東武伊勢崎線・東京メトロ銀座線「浅草駅」から徒歩7分<br>・都営浅草線「本所吾妻橋駅」A3出口から徒歩3分<br>本所吾妻橋駅から122m<br>","updateDate":"2016/8/19 17:07:53"},' +
	'{"prefecturesCode":"","lineCode":"","stationCode":"","key":"","levels":"5","tags":"","value":"","streetAddress":"","phoneNumber":"","businessHours":"","regularHoliday":"","smoking":"","parkingLot":"","externalLink":"","remarks":"","updateDate":""},' +
	'{"prefecturesCode":"","lineCode":"","stationCode":"","key":"","levels":"5","tags":"","value":"","streetAddress":"","phoneNumber":"","businessHours":"","regularHoliday":"","smoking":"","parkingLot":"","externalLink":"","remarks":"","updateDate":""}' +
']';

$(function() {
	main(null, 1, null);
	$("#navBrand").click(function() {
		main(null, 1, null);
	});
	$("#btnSearch").click(function() {
		main(null, 10, this);
	});
	$("#navAbout").click(function() {
		main(null, 11, this);
	});
	$("#navTermsofuse").click(function() {
		main(null, 12, this);
	});
	$("#navPrivacy").click(function() {
		main(null, 13, this);
	});
	$("#navGuideline").click(function() {
		main(null, 14, this);
	});
	$("#navContact").click(function() {
		main(null, 15, this);
	});
});

/**
 * 主処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 * @parme obj ターゲット要素
 */
var main = function(key, lv, obj) {
	$("#btnList").html(createBtn(key, lv, obj));
	initContents();
	var resultJson = "";
	if (lv > 9) {
		if (lv == 10) {
			$("#listMain").css("display", "block");
		} else if (lv == 11) {
			$("#about").css("display", "block");
		} else if (lv == 12) {
			$("#termsofuse").css("display", "block");
		} else if (lv == 13) {
			$("#privacy").css("display", "block");
		} else if (lv == 14) {
			$("#guideline").css("display", "block");
		} else if (lv == 15) {
			$("#contact").css("display", "block");
		}
	} else {
		if (lv == 1) {
			$("#listMain").css("display", "block");
			$.getJSON("prefectures.json", function(data) {
				$("#listMain").html(createList(data, key, lv));
			});
		} else if (lv == 2 || lv == 3) {
			$("#shopInfo").css("display", "none");
			$("#entryForm").css("display", "none");
			$("#listMain").css("display", "block");
			var s     = document.getElementsByTagName("head")[0].appendChild(document.createElement("script"));
			s.type    = "text/javascript";
			s.charset = "utf-8";
			if (lv == 2) {
				s.src = "https://www.ekidata.jp/api/p/" + key + ".json";
			} else if (lv == 3) {
				s.src = "https://www.ekidata.jp/api/l/" + key + ".json";
			}

			xml.onload = function(data) {
				var line      = data["line"];
				var station_l = data["station_l"];
				resultJson = '[';
				if (line != null) {
					for (x = 0; x < line.length; x++) {
						resultJson += '{"key":"' + line[x].line_cd + '","levels":"3","value":"' + line[x].line_name + '"},';
					}
				}
				if (station_l != null) {
					for (x = 0; x < station_l.length; x++) {
						resultJson += '{"key":"' + station_l[x].station_cd + '","levels":"4","value":"' + station_l[x].station_name + '"},';
					}
				}
				resultJson = resultJson.slice(0, -1);
				resultJson += ']';
				$("#listMain").html(createList($.parseJSON(resultJson), key, lv));
			}
		} else if (lv == 4) {
			$("#listMain").css("display", "block");
			resultJson = shopJson;
			$("#listMain").html(createList($.parseJSON(resultJson), key, lv));
		} else if (lv == 5) {
			$("#shopInfo").css("display", "block");
			resultJson = shopJson;
			$("#shopInfo").html(createInfo($.parseJSON(resultJson), key, lv));
			new google.maps.Geocoder().geocode({
				'address': $("#streetAddress").html()
			}, callbackRender);
		}
	}
};

/**
 * ボタン生成処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 * @parme obj ターゲット要素
 */
var createBtn = function(key, lv, obj) {
	var out       = "";
	var btnValue  = '<span style="font-weight: bold;" id="list' + key + '">HOME</span>';
	var btnStatus = "info";
	if (lv > 9) {
		out += '<div class="col-md-6"><button type="button" id="btnLv1" class="btn btn-secondary btn-info btn-block" onclick="main(null,1, this)"><span style="font-weight: bold;" id="listnull">HOME</span></button><input type="hidden" id="hidKey1" value="null"><input type="hidden" id="hidLv1" value="1"></div>';
		out += '<div class="col-md-6">';
		out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-primary btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)">' + obj.innerHTML + '</button>';
		out += '</div>';
	} else {
		var colSize   = 12 / lv;
		var btnKey    = null;
		var btnLv     = 1;
		for (var x = 1; x <= lv; x++) {
			if (x == lv) {
				if (obj != null) {
					if (obj.type == "button") {
						btnValue  = obj.innerHTML;
					} else {
						btnValue  = $("#list" + key).html();
					}
					btnKey = key;
					btnLv  = lv;
					if (lv == 5) {
						colSize = 4;
					}
				}
				btnStatus = "primary"
			} else {
				btnValue = $("#btnLv" + x).html();
				btnKey   = $("#hidKey" + x).val();
				btnLv    = $("#hidLv" + x).val();
				if (lv == 5) {
					colSize = 2	;
				}
			}
			out += '<div class="col-md-' + colSize + '">';
			out += '<button type="button" id="btnLv' + x + '" class="btn btn-secondary btn-' + btnStatus + ' btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)">' + btnValue + '</button>';
			out += '<input type="hidden" id="hidKey' + x + '" value=' + btnKey + '>';
			out += '<input type="hidden" id="hidLv' + x + '" value=' + btnLv + '>';
			out += '</div>';
		}
	}
	return out;
}

/**
 * リスト生成処理
 *
 * @parme json jsonデータ
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createList = function(json, key, lv) {
	var out = "";
	for (var x in json) {
		var cnt = countData(json[x].key, lv);
		var spanBadge = "";
		if (cnt > 0) {
			spanBadge = '<span class="badge" style="background-color:#2e6da4;">' + cnt + '</span>';
		}
		if (lv == 4) {
			if (json[x].stationCode == key) {
				out += '<a href="#" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '(' + json[x].key + ')</span><span class="label label-success" style="float: right;font-size: 100%;">' + json[x].tags + '</span></a>';
			}
		} else {
			out += '<a href="#" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '(' + json[x].key + ')</span>' + spanBadge + '</a>';
		}
	}
	if (lv == 4) {
		out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-danger btn-block" onclick="createEntryForm()"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>';
	}
	return out;
}

/**
 * 店舗詳細生成処理
 *
 * @parme json jsonデータ
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createInfo = function(json, key, lv) {
	var out = '<table class="table table-bordered">';
	for (var x in json) {
		if (json[x].key == key) {
			out += '<tr><th style="width:20%;">カテゴリー</th><td><a href="#" target="_blank" class="btn btn-success btn-sm active"><strong>' + json[x].tags + '</strong></a></td></tr>';
			out += '<tr><th>住所</th><td><span id="streetAddress">' + json[x].streetAddress + '</span><br><div id="map-canvas"><div/></td></tr>';
			out += '<tr><th>電話番号</th><td>' + json[x].phoneNumber + '</td></tr>';
			out += '<tr><th>営業時間</th><td>' + json[x].businessHours + '</td></tr>';
			out += '<tr><th>定休日</th><td>' + json[x].regularHoliday + '</td></tr>';
			out += '<tr><th>喫煙</th><td>' + json[x].smoking + '</td></tr>';
			out += '<tr><th>駐車場</th><td>' + json[x].parkingLot + '</td></tr>';
			out += '<tr><th>外部リンク</th><td>' + formatterLink(json[x].externalLink) + '</td></tr>';
			out += '<tr><th>備考</th><td>' + json[x].remarks + '</td></tr>';
			out += '<tr><th>更新日</th><td>' + json[x].updateDate + '</td></tr>';
		}
	}
	out += '</table>';
	return out;
}

/**
 * パッチ用カウント処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 */
var countData = function(key, lv) {
	var json = $.parseJSON(shopJson);
	var cnt = 0;
	for (var x in json) {
		if (lv == 1) {
			if (json[x].prefecturesCode == key) {
				cnt++;
			}
		} else if (lv == 2) {
			if (json[x].lineCode == key) {
				cnt++;
			}
		} else if (lv == 3) {
			if (json[x].stationCode == key) {
				cnt++;
			}
		}
	}
	return cnt
}

/**
 * 登録フォーム生成処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createEntryForm = function() {
	var key = createKey();
	$("#shopInfo").css("display", "none");
	$("#listMain").css("display", "none");
	$("#entryForm").css("display", "block");
	var out = '<div class="panel panel-default"><div class="alert alert-danger" style="display:none;" role="alert" id="errorMsg"></div>';
	out += '<form class="form-horizontal" role="form">';
	out += '<input type="hidden" class="form-control entryForm" id="prefecturesCode" value="' + $("#hidKey2").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="lineCode" value="' + $("#hidKey3").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="stationCode" value="' + $("#hidKey4").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="key" value="' + key + '">';
	out += '<input type="hidden" class="form-control entryForm" id="level" value="5">';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lbltags">カテゴリー</label><div class="col-sm-10"><input class="form-control entryForm" id="tags"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblvalue">名前</label><div class="col-sm-10"><input class="form-control entryForm" id="value"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblstreetAddress">住所</label><div class="col-sm-10"><input class="form-control entryForm" id="streetAddress"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblphoneNumber">電話番号</label><div class="col-sm-10"><input class="form-control entryForm" id="phoneNumber"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblbusinessHours">営業時間</label><div class="col-sm-10"><input class="form-control entryForm" id="businessHours"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblregularHoliday">定休日</label><div class="col-sm-10"><input class="form-control entryForm" id="regularHoliday"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblsmoking">喫煙</label><div class="col-sm-10"><input class="form-control entryForm" id="smoking"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblparkingLot">駐車場</label><div class="col-sm-10"><input class="form-control entryForm" id="parkingLot"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblexternalLink">外部リンク</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="externalLink"></textarea></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblremarks">備考</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="remarks"></textarea></div></div>';
	out += '</form>';
	out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-success btn-block" onclick="checkForm()">確認</span></button></div>';
	$("#entryForm").html(out);
}

/**
 * key値生成処理
 *
 * 店舗データからkeyの最大値を取得しインクリメントして返す
 */
var createKey = function() {
	var json = $.parseJSON(shopJson);
	var arrkey = [];
	for (var x in json) {
		for (var key in json[x]) {
			if (key == "key" && json[x].key.length != 0) {
				arrkey.push(json[x].key);
			}
		}
	}
	arrkey.reverse();
	var newKey = Number(arrkey[0]) + 1;
	return newKey;
}

/**
 * 登録フォーム入力チェック処理
 *
 * エラーがあればエラーメッセージ出力、なければjson文字列を生成し確認画面を作成する
 */
var checkForm = function() {
	var form = $(".entryForm");
	var errMsg = "";
	var successJson = '{';
	for (var x = 0; x < form.length; x++) {
		if (!form[x].value) {
			errMsg += '<strong>' + $("#lbl" + form[x].id).html() + '</strong>が入力されていません。<br>';
		} else {
			successJson += '"' + form[x].id + '":"' + form[x].value.replace(/\r?\n/g, '<br>') + '",'
		}
	}
	var date = new Date($.now()).toLocaleString();
	successJson += '"updateDate":"' + date + '"'
	successJson += '}';
	if (!errMsg) {
		$("#errorMsg").css("display", "none");
		$("#entryForm").html(createConfirm($.parseJSON(successJson)));
	} else {
		$("#errorMsg").html(errMsg);
		$("#errorMsg").css("display", "block");
	}
}

/**
 * 確認画面生成処理
 *
 * @parme strJson 画面入力値のjson文字列
 */
var createConfirm = function(json) {
	var out  = '<table class="table table-bordered">';
	out += '<tr><th>カテゴリー</th><td>' + json.tags + '</td></tr>';
	out += '<tr><th>名前</th><td>' + json.value + '</td></tr>';
	out += '<tr><th>住所</th><td><span id="streetAddress">' + json.streetAddress + '</span><br><div id="map-canvas"><div/></td></tr>';
	out += '<tr><th>電話番号</th><td>' + json.phoneNumber + '</td></tr>';
	out += '<tr><th>営業時間</th><td>' + json.businessHours + '</td></tr>';
	out += '<tr><th>定休日</th><td>' + json.regularHoliday + '</td></tr>';
	out += '<tr><th>喫煙</th><td>' + json.smoking + '</td></tr>';
	out += '<tr><th>駐車場</th><td>' + json.parkingLot + '</td></tr>';
	out += '<tr><th>外部リンク</th><td>' + json.externalLink + '</td></tr>';
	out += '<tr><th>備考</th><td>' + json.remarks + '</td></tr>';
	out += '<tr><th>更新日</th><td>' + json.updateDate + '</td></tr>';
	out += '</table>';
	out += '<input type="hidden" id="hidJson" value="' + encodeURIComponent(JSON.stringify(json)) + '">';
	out += '<button type="button" id="btnUpdate" class="btn btn-secondary btn-success btn-block" onclick="sendEntryForm()">登録</span></button>';
	return out;
}

/**
 * 登録フォームメール送信処理
 */
var sendEntryForm = function() {
	var strJson = decodeURIComponent($("#hidJson").val());
	$.ajax({
		url: "https://formspree.io/fresnes3183@gmail.com",
		method: "POST",
		data: {
			message: strJson
		},
		dataType: "json"
	});
	var out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">路線データベースへのご登録ありがとうございました。</h3></div><div class="panel-body">ご登録いただいた店舗データについて内容を精査するため反映までに最大1週間ほどかかります。<br>1週間以上反映が無い場合、内容に不備があったものとしてお手数ですが再度ご登録お願いします。</div></div>';
	$("#entryForm").html(out);
}

/**
 * 外部リンク生成処理
 *
 * @parme externalLink 外部リンク文字列
 */
var regTabelog = new RegExp("tabelog");
var regTwitter = new RegExp("twitter");
var formatterLink = function(externalLink) {
	var out = '';
	var arrLink = externalLink.split("<br>");
	for (var x = 0; x < arrLink.length; x++) {
		if (arrLink[x].match(regTabelog)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>食べログ</strong></a>';
		} else if (arrLink[x].match(regTwitter)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>twitter</strong></a>';
		} else {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>ホームページ</strong></a>';
		}
	}
	return out;
}

/**
 * ジオコーダの結果を取得したときに実行するコールバック関数。
 * この関数内で GoogleMap を出力する。
 *
 * @param results ジオコーダの結果
 * @param status ジオコーディングのステータス
 */
var callbackRender = function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		var options = {
			zoom: 18,
			center: results[0].geometry.location, // 指定の住所から計算した緯度経度を指定する
			mapTypeId: google.maps.MapTypeId.ROADMAP // 「地図」で GoogleMap を出力する
		};
		var gmap = new google.maps.Map(document.getElementById('map-canvas'), options);
		// #map-canvas に GoogleMap を出力する
		new google.maps.Marker({
			map: gmap,
			position: results[0].geometry.location
		});
		// 指定の住所から計算した緯度経度の位置に Marker を立てる
		adjustMapSize();
	}
}

/**
 * GoogleMap を表示する部分のサイズを調整する。
 *
 */
var adjustMapSize = function() {
	var mapCanvas = $('#map-canvas');
	mapCanvas.css("height", ($(window).height() - mapCanvas.offset().top) + "px");
}

var initContents = function() {
	var contents = $(".rowcontent");
	for (var x = 0; x < contents.length; x++) {
		$("#" + contents[x].id).css("display", "none");
	}
}
