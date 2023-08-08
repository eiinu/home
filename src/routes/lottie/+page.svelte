<svelte:head>
	<title>Lottie</title>
	<meta name="description" content="Tools of Lottie" />
</svelte:head>

<script lang="ts">
	// import LottieCompress from 'lottie-compress';
	let inputJson = '';
	let outJson = '';
	const change = (e: any) => {
		if (e.target && e.target.files) {
			const file = e.target.files[0]
			const reader = new FileReader();
			reader.readAsText(file,"utf8");//gbk编码
			reader.onload = () => {
				inputJson = String(reader.result);// 文本内容
			};
		}
	}
	const click = () => {
		// const LC = LottieCompress.defualt(JSON.parse(inputJson));
		// LC.execute().then((res: string) => {
		// 	outJson = res
		// });
		showDownload = true
	}
	let showDownload = false
	const download = () => {
    var aTag = document.createElement('a');
    var blob = new Blob([outJson]);
    aTag.download = 'out.json';
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    // URL.revokeObjectURL(blob);
	}
</script>

<div class="lottie">
	<h1 class="text-80 color-blue">Lottie Compression</h1>
	<input type="file" on:change={change}>
	<pre>
		{inputJson}
	</pre>
	<button on:click={click}>点击进行压缩</button>
{#if showDownload}
	<button on:click={download}>点击下载压缩后的文件</button>
{/if}
</div>

<style lang="scss">

</style>